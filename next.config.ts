import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL('https://www.gstatic.com/flights/airline_logos/70px/**'),
    ],
  },
};

export default nextConfig;
