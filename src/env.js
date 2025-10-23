import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    THIRDWEB_SECRET_KEY: z.string(),
    ADMIN_PRIVATE_KEY: z.string().startsWith("0x"),
    AIRDROP_CONTRACT: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    MOCHI_TOKEN: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    MOCHI_PER_STICKER_TOKENS: z.string(),          // "20000000"
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),
    BASE_CHAIN_ID: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID: z.string(),
    NEXT_PUBLIC_BUILDER_API_KEY: z.string(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    THIRDWEB_SECRET_KEY: process.env.THIRDWEB_SECRET_KEY,
    ADMIN_PRIVATE_KEY: process.env.ADMIN_PRIVATE_KEY,
    AIRDROP_CONTRACT: process.env.AIRDROP_CONTRACT,
    MOCHI_TOKEN: process.env.MOCHI_TOKEN,
    MOCHI_PER_STICKER_TOKENS: process.env.MOCHI_PER_STICKER_TOKENS,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    BASE_CHAIN_ID: process.env.BASE_CHAIN_ID,
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
    NEXT_PUBLIC_BUILDER_API_KEY: process.env.NEXT_PUBLIC_BUILDER_API_KEY,
  },
});
