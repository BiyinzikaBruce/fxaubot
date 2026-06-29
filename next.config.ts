import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/client-runtime-utils",
    "@prisma/adapter-neon",
    "@neondatabase/serverless",
    "better-auth",
    "@better-auth/prisma-adapter",
    "metaapi.cloud-sdk",
  ],
};

export default nextConfig;
