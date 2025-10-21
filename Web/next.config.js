/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Rewrites for API calls
  async rewrites() {
    // في Development
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3001/:path*',
        },
      ];
    }
    // في Production (Replit)
    return [];
  },
  
  // Images from Supabase
  images: {
    domains: ['localhost', 'supabase.co', 'supabase.net'],
  },
  
  // Disable telemetry
  telemetry: false,
}

module.exports = nextConfig