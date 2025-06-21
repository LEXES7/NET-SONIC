/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the 'output: export' line!
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

module.exports = nextConfig;