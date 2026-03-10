/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['isomorphic-dompurify', 'jsdom'],
};

module.exports = nextConfig;
