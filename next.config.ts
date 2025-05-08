import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Desabilita a verificação do ESLint durante o build
    ignoreDuringBuilds: true,
  },
  
  // Modo estrito do React para desenvolvimento mais seguro
  reactStrictMode: true,
  
  // Configuração para desabilitar a geração estática para rotas de API
  output: 'standalone',
  
  // Configuração específica para rotas de API de autenticação
  async headers() {
    return [
      {
        source: '/api/auth/:path*',
        headers: [
          {
            key: 'x-nextjs-data',
            value: 'no-static-optimization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;