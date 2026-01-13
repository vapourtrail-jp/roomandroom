import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ['three'],

  // WordPressの画像を表示するための許可設定
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cms.roomandroom.org',
        port: '',
        pathname: '/w/wp-content/uploads/**',
      },
    ],
  },

  // roomandroom.pages.dev から www.roomandroom.org へのリダイレクト設定
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