import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Attention : Cela permet aux builds de production de réussir même si votre projet contient des erreurs ESLint.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
