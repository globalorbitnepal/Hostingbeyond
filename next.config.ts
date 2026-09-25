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
        source: "/domain-name-search/:path+",
        destination: "/domain-name-search",
        permanent: false,
      },
      {
        source: "/hosting",
        destination: "/web-hosting",
        permanent: true,
      },
      {
        source: "/hosting/:path*",
        destination: "/web-hosting/:path*",
        permanent: true,
      },
      {
        source: "/cloud",
        destination: "/cloud-hosting",
        permanent: true,
      },
    ];
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    routerBFCache: true,
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
    serverActions: {
      bodySizeLimit: "32mb",
    },
  },
};

export default nextConfig;
