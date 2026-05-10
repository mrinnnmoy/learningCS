import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  transpilePackages: ["@acme/ui", "@acme/utils", "@acme/types"],
};

export default config;
