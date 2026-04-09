import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/login',
        destination: '/api/login-html',
      },
    ];
  },
};

export default nextConfig;
