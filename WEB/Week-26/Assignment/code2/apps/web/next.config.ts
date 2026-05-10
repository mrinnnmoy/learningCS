import type { NextConfig } from "next";

const config: NextConfig = {
  // Required: Next.js must transpile packages that contain TypeScript source
  // (packages that set main/exports to .ts files instead of compiled .js)
  transpilePackages: [
    "@acme/ui",
    "@acme/utils",
    "@acme/types",
    "@acme/api-client",
  ],
};

export default config;
