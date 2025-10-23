import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { SUPPORTED_CHAINS } from "~/constants/chains";
import { env } from "~/env";

import { Redis } from "@upstash/redis";
import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  sendTransaction,
  readContract,
} from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";
import type { Chain } from "thirdweb/chains";

// --- thirdweb setup (server only) ---
const client = createThirdwebClient({ secretKey: env.THIRDWEB_SECRET_KEY });

// --- Upstash Redis (idempotent claim state) ---
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// Helpers for consistent keys
const claimKey = (chainId: number, code: string) => `mochi:claim:${chainId}:${code}`;
const txKey    = (chainId: number, code: string) => `mochi:tx:${chainId}:${code}`;

export const treasureRouter = createTRPCRouter({
  // For the Builder widget overlay
  getIsTreasureClaimed: publicProcedure
    .input(z.object({ chainId: z.number(), uniqueName: z.string(), amount: z.string() }))
    .query(async ({ input }) => {
      const key = claimKey(input.chainId, input.uniqueName);
      const exists = await redis.exists(key);
      return exists === 1;
    }),

  // Called when the user presses "Claim"
  claimTreasure: publicProcedure
    .input(
      z.object({
        chainId: z.number(),       // should be 8453 (Base)
        uniqueName: z.string(),    // your per-sticker claim code
        amount: z.string(),        // ignored server-side; we use env.MOCHI_PER_STICKER_TOKENS
        recipient: z.string(),     // wallet address from Coinbase Wallet
      }),
    )
    .mutation(async ({ input }) => {
      const { chainId, uniqueName, recipient } = input;

      // Validate the chain
      const chain: Chain | undefined = SUPPORTED_CHAINS.find((c) => c.id === chainId);
      if (!chain) {
        throw new Error("Unsupported chain");
      }

      // First-come-first-served lock (NX: set only if not exists)
      const key = claimKey(chainId, uniqueName);
      const locked = await redis.set<string>(key, recipient, { nx: true });
      if (locked !== "OK") {
        throw new Error("claimed or invalid");
      }

      try {
        // 1) Read ERC20 decimals
        const token = getContract({ client, chain, address: env.MOCHI_TOKEN as `0x${string}` });
        const decimalsRaw = await readContract({
          contract: token,
          method: "function decimals() view returns (uint8)",
        });
        const decimals = Number(decimalsRaw);

        // 2) Convert human tokens -> base units
        const human = BigInt(env.MOCHI_PER_STICKER_TOKENS); // "20000000"
        const amount = human * (10n ** BigInt(decimals));

        // 3) Prepare Airdrop call (signature string avoids typing issues)
        const airdrop = getContract({ client, chain, address: env.AIRDROP_CONTRACT as `0x${string}` });
        const tx = prepareContractCall({
          contract: airdrop,
          method: "function airdropERC20(address token, (address recipient, uint256 amount)[] contents)",
          params: [env.MOCHI_TOKEN as `0x${string}`, [{ recipient: recipient as `0x${string}`, amount }]],
        });

        // 4) Sign & send from payout wallet
        const account = privateKeyToAccount({ client, privateKey: env.ADMIN_PRIVATE_KEY });
        const receipt = await sendTransaction({ transaction: tx, account });

        await redis.set(txKey(chainId, uniqueName), receipt.transactionHash);
        return receipt;
      } catch (err: unknown) {
  // unlock so someone else can try again; ignore unlock failures
        try {
          await redis.del(key);
        } catch (unlockErr) {
    // keep logs out of production; this makes the block non-empty for eslint
          if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
            console.warn("unlock failed:", unlockErr instanceof Error ? unlockErr.message : unlockErr);
    }
  }
  const message = err instanceof Error ? err.message : "Transaction failed";
  throw new Error(message);
}

    }),
});
