import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'randomuser.me',
      'www.townofws.ca',
      'images.pexels.com',
      'upload.wikimedia.org',
      'firebasestorage.googleapis.com', 
      'cdn.stealdeals.co.in', 
      'www.crescent-builders.com', 
      'www.investopedia.com',
      'propertyadviser.in'
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'previews.dropbox.com',
      },
      {
        protocol: 'https',
        hostname: '**.dropbox.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
    formats: ['image/avif', 'image/webp'],
    unoptimized: true,
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    // Fix HMR issues
    optimizePackageImports: ['react', 'react-dom'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  reactStrictMode: false,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 5,
  },
  webpack: (config, { dev, isServer }) => {
    if (!isServer && dev) {
      // Reduce excessive Fast Refresh rebuilds
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 600,
        ignored: [
          '**/node_modules/**',
          '**/.next/**',
          '**/.git/**',
          '**/coverage/**',
          '**/dist/**'
        ],
      };
      
      // Optimize for development and prevent worker issues
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };

      // Prevent Jest worker conflicts
      config.resolve = {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          'jest-worker': false,
        }
      };
    }
    
    // Prevent memory leaks and worker issues
    config.infrastructureLogging = {
      level: 'error',
    };
    
    return config;
  },
  compiler: {
    reactRemoveProperties: process.env.NODE_ENV === 'production' ? { properties: ['^data-bis', '^bis_'] } : false,
  },
  // Suppress browser extension related errors
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
};

export default nextConfig;
