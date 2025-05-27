import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',         // 静的エクスポートモード
  basePath: '/breakout-next', // Pages URL のパス  /* config options here */
};

export default nextConfig;
