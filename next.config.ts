import type { NextConfig } from "next";

const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com', // 사용하는 외부 이미지 도메인
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
};

export default nextConfig;
