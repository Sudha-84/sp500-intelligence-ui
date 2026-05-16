/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,

  // API routes proxy to Java microservices via Next.js server-side rewrites
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: `${process.env.AUTH_SERVICE_URL || 'http://localhost:8081'}/:path*`,
      },
      {
        source: '/api/signals/:path*',
        destination: `${process.env.SIGNAL_SERVICE_URL || 'http://localhost:8082'}/signals/:path*`,
      },
      {
        source: '/api/prices/:path*',
        destination: `${process.env.PRICE_SERVICE_URL || 'http://localhost:8083'}/prices/:path*`,
      },
      {
        source: '/api/sentiment/:path*',
        destination: `${process.env.SENTIMENT_SERVICE_URL || 'http://localhost:8084'}/sentiment/:path*`,
      },
      {
        source: '/api/watchlists/:path*',
        destination: `${process.env.WATCHLIST_SERVICE_URL || 'http://localhost:8085'}/watchlists/:path*`,
      },
      {
        source: '/api/users/:path*',
        destination: `${process.env.USER_SERVICE_URL || 'http://localhost:8086'}/users/:path*`,
      },
    ];
  },

  images: {
    domains: ['lh3.googleusercontent.com'],
  },
};

module.exports = nextConfig;

