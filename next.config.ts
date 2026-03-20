import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [];
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
