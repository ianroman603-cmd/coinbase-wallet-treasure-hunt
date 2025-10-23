import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { SUPPORTED_CHAINS } from "~/constants/chains";

import { createThirdwebClient, getContract, prepareContractCall, sendTransaction, readContract } from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";
import { env } from "~/env";

import { Redis } from "@upstash/redis";

// --- thirdweb setup (server) ---
const client = createThirdwebClient({ secretKey: env.THIRDWEB_SECRET_KEY });

// --- Upstash Redis (no DB needed) ---
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// Minimal ABIs
const erc20Abi = [
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
];

const airdropAbi = [
  {
    type: "function",
    name: "airdropERC20",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      {
        name: "contents",
        type: "tuple[]",
        components: [
          { name: "recipient", type: "address" },
          { name: "amount", type: "uint256" },
        ],
      },
    ],
    outputs: [],
  },
];

function claimKey(chainId: number, code: string) {
  return `mochi:claim:${chainId}:${code}`;
}
function txKey(chainId: number, code: string) {
  return `mochi:tx:${chainId}:${code}`;
}

export const treasureRouter = createTRPCRouter({
  // Used by the widget to show "Claimed" overlay
  getIsTreasureClaimed: publicProcedure
    .input(z.object({ chainId: z.number(), uniqueName: z.string(), amount: z.string() }))
    .query(async ({ input }) => {
      const key = claimKey(input.chainId, input.uniqueName);
      const exists = await redis.exists(key); // 1 if claimed, 0 if not
      return Boolean(exists);
    }),

  // Called when user presses "Claim"
  claimTreasure: publicProcedure
    .input(
      z.object({
        chainId: z.number(),       // should be 8453 (Base)
        uniqueName: z.string(),    // your per-sticker code (from Excel / Builder)
        amount: z.string(),        // not trusted; server uses env.MOCHI_PER_STICKER_TOKENS
        recipient: z.string(),     // wallet address from Coinbase Wallet
      }),
    )
    .mutation(async ({ input }) => {
      const { chainId, uniqueName, recipient } = input;

      // Only allow chains you support (Base mainnet is in SUPPORTED_CHAINS)
      const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
      if (!chain) throw new Error("Unsupported chain");

      const key = claimKey(chainId, uniqueName);

      // First-come-first-served lock (atomic)
      // NX = set only if not exists. Returns "OK" if we acquired the claim, null if already claimed.
      const locked = await redis.set<string>(key, recipient, { nx: true });
      if (locked !== "OK") {
        throw new Error("claimed or invalid");
      }

      try { 
        // Compute amount in base units using on-chain decimals
        const token = getContract({ client, chain, address: env.MOCHI_TOKEN as `0x${string}` });
        
        const decimalsRaw = await readContract({
          contract: token,
  // method signature string avoids typing issues and works without a full ABI
          method: "function decimals() view returns (uint8)",
        });
        const decimals = Number(decimalsRaw);
        
        const human = BigInt(env.MOCHI_PER_STICKER_TOKENS); // "20000000"
        const amount = human * (10n ** BigInt(decimals));

        // Prepare Airdrop call
        const airdrop = getContract({
          client,
          chain,
          address: env.AIRDROP_CONTRACT as `0x${string}`,
          abi: airdropAbi as any,
        });

        const tx = prepareContractCall({
          contract: airdrop,
          method: "airdropERC20",
          params: [env.MOCHI_TOKEN as `0x${string}`, [{ recipient: recipient as `0x${string}`, amount }]],
        });

        // Sign & send from your payout wallet
        const account = privateKeyToAccount({ client, privateKey: env.ADMIN_PRIVATE_KEY });
        const receipt = await sendTransaction({ transaction: tx, account });

        // store tx for UI/debug
        await redis.set(txKey(chainId, uniqueName), receipt.transactionHash);

        return receipt;
      } catch (err: any) {
        // unlock on failure so someone else can try
        await redis.del(key);
        throw new Error(err?.message ?? "Transaction failed");
      }
    }),
});
