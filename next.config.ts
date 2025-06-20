import type { NextConfig } from 'next';

// 1. PWAプラグインを読み込み、基本的な設定を行う
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  // 開発環境ではPWAを無効化し、ビルド時にのみ有効にする
  disable: process.env.NODE_ENV === "development",
});

// GitHub Pagesのリポジトリ名を設定
const repoName = 'breakout-next';

// 2. Next.jsの基本設定を定義する
const nextConfig: NextConfig = {
  output: 'export',
  // GitHub Pagesで正しく動作するようにパスを設定
  basePath: `/${repoName}`,
  assetPrefix: `/${repoName}/`,
  trailingSlash: true,
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = { fs: false, path: false };
    }
    return config;
  },
};

// 3. PWA設定を適用して最終的な設定をエクスポートする
module.exports = withPWA(nextConfig);
