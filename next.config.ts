import type { NextConfig } from "next";

// GitHub Pages serves a project site under /<repo>; the deploy workflow passes that in.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: {
    // No image optimiser on a static host — Unsplash already resizes via the URL.
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
