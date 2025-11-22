import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
