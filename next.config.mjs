/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['randomuser.me'], // Add the external domain
    // OR use remotePatterns for more control (Next.js 13+)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/api/portrait/**',
      },
    ],
  },
};

export default nextConfig;

