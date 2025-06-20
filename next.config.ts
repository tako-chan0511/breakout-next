import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  // 開発中はPWAを無効化し、ビルド時にのみ有効にする設定
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Vercelにデプロイする場合、以下のパス設定は不要です。
  // Vercelが自動的に最適化します。
  // output: undefined,
  // trailingSlash: false,
  // basePath: "",
  // assetPrefix: "",

  // 既存のカスタム設定は維持します
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {},
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = { fs: false, path: false };
    }
    return config;
  },
};

// ★★★ 修正点: withPWAでラップした設定のみをエクスポートする ★★★
module.exports = withPWA(nextConfig);
