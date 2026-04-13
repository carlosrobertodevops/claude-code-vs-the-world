import { Elysia } from "elysia";

export const uploadRoutes = new Elysia({ prefix: "/upload" }).get("/", () => ({
  success: true,
  data: {
    acceptedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
    maxSizeMb: 10,
    storageProviders: ["local", "minio"],
  },
}));
