import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Avatar uploads are capped at 1 MB; leave room for multipart overhead.
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
