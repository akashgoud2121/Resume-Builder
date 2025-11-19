
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    // Remove console.log/info/debug in production, keep error/warn
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  typescript: {
    // Strict type checking in production
    ignoreBuildErrors: false,
  },
  eslint: {
    // Strict linting in production
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
