import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here - reloaded for product reviews crud */
  allowedDevOrigins: ["192.168.137.70", "smomo.shop", "seller-area.smomo.shop"],
  output: "standalone",
};

export default nextConfig;

