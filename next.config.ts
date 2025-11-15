
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
    // In production, you may want to set this to false for stricter type checking
    ignoreBuildErrors: process.env.NODE_ENV === 'production' ? false : true,
  },
  eslint: {
    // In production, you may want to set this to false for stricter linting
    ignoreDuringBuilds: process.env.NODE_ENV === 'production' ? false : true,
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
