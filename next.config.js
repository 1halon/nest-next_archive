/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = require("next-pwa")({
  ...nextConfig,
  pwa: {
    dest: "public",
    disable: process.env.NODE_ENV === "development"
  },
});
