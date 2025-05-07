import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Desabilita a verificação do ESLint durante o build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;