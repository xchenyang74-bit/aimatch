import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [];
  },
  async rewrites() {
    return [
      {
        source: '/login',
        destination: '/login.html',
      },
    ];
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
