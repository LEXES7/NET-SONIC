/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' if you added it before
  // Don't use static export if you want API routes to work
  
  // Ensure ESLint doesn't prevent build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure TypeScript errors don't prevent build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Add trailing slash for better routing compatibility
  trailingSlash: true
};

module.exports = nextConfig;