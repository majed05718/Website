
// web/next.config.js (إزالة experimental.appDir)
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BUILD_TIME: new Date().toISOString(),
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
