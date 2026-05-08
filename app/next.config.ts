import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['84.247.147.180', 'omilearn.com', 'www.omilearn.com', 'localhost'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '150887851378-ital3u4b2p6orjp8g6p27i6spcdplq0e.apps.googleusercontent.com',
  },
};

export default nextConfig;
