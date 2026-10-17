import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["smomo.shop", "www.smomo.shop", "localhost", "127.0.0.1"],
  output: "standalone",
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "http://localhost:3000/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
