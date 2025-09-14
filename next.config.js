/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Serve app/icon.png whenever the browser asks for /favicon.ico
      { source: '/favicon.ico', destination: '/icon.png' },
    ];
  },
};
module.exports = nextConfig;
