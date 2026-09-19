import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9999",
        pathname: "/uploads/**",
      },
    ],
  },
}

export default nextConfig
