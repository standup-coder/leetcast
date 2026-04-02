/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@leetcast/core', '@leetcast/database'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
