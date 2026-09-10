import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 全ページを静的 HTML として out/ に書き出す（Cloudflare Pages で静的配信）
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cms.roomandroom.org',
        port: '',
        pathname: '/w/wp-content/uploads/**',
      },
    ],
  },
  // roomandroom.pages.dev / apex → www の転送は public/_redirects と Cloudflare Rules で行う
};

export default nextConfig;
