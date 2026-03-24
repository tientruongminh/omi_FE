import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['84.247.147.180', 'omilearn.com', 'www.omilearn.com'],
  experimental: {
    turbo: {
      resolveAlias: {
        tailwindcss: path.resolve(__dirname, 'node_modules/tailwindcss'),
      },
    },
  },
};

export default nextConfig;
