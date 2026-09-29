import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "remotive.com" },
      { protocol: "https", hostname: "remoteok.com" },
    ],
  },
};

export default nextConfig;
