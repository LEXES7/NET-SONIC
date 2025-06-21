/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure ESLint doesn't prevent build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure TypeScript errors don't prevent build
  typescript: {
    ignoreBuildErrors: true,
  }
};

module.exports = nextConfig;