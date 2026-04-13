import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["elysia", "postgres"],
};

export default nextConfig;
