import { createThirdwebClient, getContract, sendAndConfirmTransaction, simulateTransaction, toWei } from "thirdweb";
import { z } from "zod";
import { MOCHI_HUNT } from "~/constants/addresses";
import { SUPPORTED_CHAINS } from "~/constants/chains";
import { env } from "~/env";
import { isTreasureClaimed, claimTreasure } from "~/thirdweb/84532/0xbed542362669f815c49004acceb1bffd87259f5f";
import { privateKeyToAccount } from "thirdweb/wallets";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const client = createThirdwebClient({
  secretKey: env.THIRDWEB_SECRET_KEY,
});

export const treasureRouter = createTRPCRouter({
  claimTreasure: publicProcedure
    .input(z.object({
      chainId: z.number(),
      uniqueName: z.string(),
      amount: z.string(),
      recipient: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { chainId, uniqueName, amount, recipient } = input;
      const mochiHuntAddress = MOCHI_HUNT[chainId];
      if (!mochiHuntAddress) {
        throw new Error("Chain not supported");
      }
      const contract = getContract({
        client,
        address: mochiHuntAddress,
        chain: SUPPORTED_CHAINS.find((chain) => chain.id === chainId)!,
      });
      const transaction = claimTreasure({
        contract,
        treasure: uniqueName,
        to: recipient,
        amount: toWei(amount),
      });
      console.log({ amount: toWei(amount) })
      const account = privateKeyToAccount({
        client,
        privateKey: env.ADMIN_PRIVATE_KEY,
      });
      try {
        await simulateTransaction({
          transaction,
          account,
        }) as number;
  
        const receipt = await sendAndConfirmTransaction({
          transaction,
          account,
        });
        return receipt;
      } catch (error) {
        console.error(error);
        throw new Error("Transaction failed");
      }
    }),
  getIsTreasureClaimed: publicProcedure
    .input(z.object({
      chainId: z.number(),
      uniqueName: z.string(),
      amount: z.string(),
    }))
    .query(async ({ input }) => {
      const { chainId, uniqueName } = input;
      const mochiHuntAddress = MOCHI_HUNT[chainId];
      if (!mochiHuntAddress) {
        throw new Error("Chain not supported");
      }
      const contract = getContract({
        client,
        address: mochiHuntAddress,
        chain: SUPPORTED_CHAINS.find((chain) => chain.id === chainId)!,
      });
      return await isTreasureClaimed({
        contract,
        treasure: uniqueName,
      });
    }),
});
