/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  turbopack: false,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://chu-dialyse.onrender.com',
  },
};

module.exports = nextConfig;
