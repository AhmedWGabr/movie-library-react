import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**', // Allows any path under /t/p/ (e.g., /t/p/w500/, /t/p/original/)
      },
    ],
  },
  /* other config options can go here */
};

export default nextConfig;
