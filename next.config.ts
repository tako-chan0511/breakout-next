import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  basePath:     isProd ? '/breakout-next' : '',
  assetPrefix:  isProd ? '/breakout-next' : '',
  trailingSlash: true,
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },
};

export default nextConfig;
