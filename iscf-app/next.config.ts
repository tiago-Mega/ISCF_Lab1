import type { NextConfig } from "next";
import dotenv from "dotenv";
import path from "path";

// Load the root .env file (one level up from iscf-app/)
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const nextConfig: NextConfig = {
  env: {
    // Map root .env variables into Next.js NEXT_PUBLIC_ names
    NEXT_PUBLIC_API_URL: process.env.API_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_KEY,
  },
};

export default nextConfig;
