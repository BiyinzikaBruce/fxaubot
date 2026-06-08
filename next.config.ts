import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-neon", "better-auth", "@better-auth/prisma-adapter"],
};

export default nextConfig;
