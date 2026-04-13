import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default("postgres://postgres:postgres@localhost:5432/lavaflow"),
  NEXTAUTH_URL: z.string().default("http://localhost:3000"),
  NEXTAUTH_SECRET: z.string().default("change-me-in-production"),
  PUBLIC_QUEUE_SLUG: z.string().default("lavaflow-centro"),
  APP_URL: z.string().default("http://localhost:3000"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  PUBLIC_QUEUE_SLUG: process.env.PUBLIC_QUEUE_SLUG,
  APP_URL: process.env.APP_URL,
});
