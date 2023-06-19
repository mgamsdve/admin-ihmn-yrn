/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "firebasestorage.googleapis.com",
      "cdn.pixabay.com",
      "pbs.twimg.com",
    ],
  },
};

module.exports = nextConfig;
