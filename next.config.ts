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
    if (!isServer) {
      // firebase-admin is a Node.js-only package (uses http2 + node:* builtins like
      // node:events, node:process, node:stream, node:util). firestore-wishlist.ts is a
      // hybrid module imported by BOTH client contexts (RTDB/real-time listeners) and server
      // API routes (Admin SDK). A plain dynamic import() lets webpack follow the chain into
      // firebase-admin for the client bundle, which crashes the browser build.
      //
      // Mark firebase-admin (and its gRPC transport) as EXTERNAL for client builds: webpack
      // then emits `require('firebase-admin')` without ever parsing its source, so none of
      // the Node-only internals are compiled for the browser. The admin code path only runs
      // on the server, where it resolves from node_modules — this is purely a guard so the
      // client build never sees http2 / node:* imports.
      config.externals = config.externals || [];
      if (!Array.isArray(config.externals)) {
        config.externals = [config.externals];
      }
      if (!config.externals.includes('firebase-admin')) {
        config.externals.push('firebase-admin');
      }

      // Keep the per-module fallbacks as a secondary safety net for any bare-name Node
      // builtins that slip through transitive dependencies.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        http2: false,
        crypto: false,
        http: false,
        https: false,
        stream: false,
        buffer: false,
        util: false,
        url: false,
        zlib: false,
        path: false,
        os: false,
        child_process: false,
      };
    }

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
  
  // Redirect all wishlist traffic to working route
  async redirects() {
    return [
      {
        source: '/wishlist',
        destination: '/my-wishlist',
        permanent: true, // 301 redirect - tells search engines this is the new location
      },
      {
        source: '/wishlist/:path*',
        destination: '/my-wishlist/:path*',
        permanent: true,
      }
    ];
  },

  // Keep firebase-admin out of client bundles (it needs Node.js builtins)
  serverExternalPackages: ['firebase-admin'],

  // Debug route generation
  ...(process.env.NODE_ENV === 'production' && {
    generateBuildId: async () => {
      console.log('[BUILD_DEBUG] Generating build ID...');
      return `build-${Date.now()}`;
    },
    onDemandEntries: {
      maxInactiveAge: 60 * 1000,
      pagesBufferLength: 5,
    },
    // Ensure all routes are included
    trailingSlash: false,
    skipMiddlewareUrlNormalize: true,
  }),
};

export default nextConfig;
