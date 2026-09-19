import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [
      { pathname: "/images/**" },
      { pathname: "/logo/**" },
      { pathname: "/uploads/**" },
      { pathname: "/api/uploads/**" },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/w**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/domains",
        destination: "/domain-name-search",
        permanent: true,
      },
      {
        source: "/domains/:path*",
        destination: "/domain-name-search",
        permanent: true,
      },
      {
        source: "/domain-search",
        destination: "/domain-name-search",
        permanent: true,
      },
      {
        source: "/domain-name-search/:path*",
        destination: "/domain-name-search",
        permanent: false,
      },
    ];
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    serverActions: {
      bodySizeLimit: "32mb",
    },
  },
};

export default nextConfig;
