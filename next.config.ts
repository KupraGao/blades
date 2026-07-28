import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kkdbbhddjfcacvtlitmw.supabase.co",
      },
      {
        protocol: "https",
        hostname: "www.benchmade.com",
      },
    ],
  },
};

export default nextConfig;