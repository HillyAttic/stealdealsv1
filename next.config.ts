import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'images.unsplash.com',
      'randomuser.me',
      'www.townofws.ca',
      'images.pexels.com',
      'upload.wikimedia.org'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
