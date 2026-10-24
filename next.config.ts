import type { NextConfig } from "next";

// GitHub Pages serves a static folder. A user site (MarkT-D.github.io) lives at
// the root; a project site needs its repo name as the base path.
const basePath = process.env.BASE_PATH ?? "";

const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  agentRules: false,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default config;
