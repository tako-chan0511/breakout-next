import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',        // 静的エクスポートモード
  // 本番環境ではサブパスを設定, ローカル開発ではルートを使用
  basePath: isProd ? '/breakout-next' : '',
};

export default nextConfig;
