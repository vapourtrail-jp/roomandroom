import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ['three'],

  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'roomandroom.pages.dev',
          },
        ],
        destination: 'https://www.roomandroom.org/:path*',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;