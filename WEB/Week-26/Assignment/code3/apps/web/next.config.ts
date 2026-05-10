import type { NextConfig } from "next";

const config: NextConfig = {
  // Required for Docker — produces a standalone server with all dependencies bundled
  output: "standalone",
  transpilePackages: [
    "@acme/ui",
    "@acme/utils",
    "@acme/types",
    "@acme/api-client",
  ],
};

export default config;
