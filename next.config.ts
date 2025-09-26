import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL || "mongodb+srv://engelsayedebaid_db_user:lmhTxMTD4rebSHZw@cluster0.rolmxz8.mongodb.net/cv-management?retryWrites=true&w=majority",
    JWT_SECRET: process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production-2024",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "your-nextauth-secret-key-2024",
  },
};

export default nextConfig;
