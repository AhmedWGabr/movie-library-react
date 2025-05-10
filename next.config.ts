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
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/vi/**', // Allows any path under /vi/ (e.g., /vi/VIDEO_ID/hqdefault.jpg)
      },
    ],
  },
  /* other config options can go here */
};

export default nextConfig;
