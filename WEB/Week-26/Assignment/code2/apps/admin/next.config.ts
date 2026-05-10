import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@acme/ui", "@acme/utils", "@acme/types"],
};

export default config;
