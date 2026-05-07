import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  allowedDevOrigins: ["localhost:3000", "127.0.0.1:3000"],
  // Pin project root when multiple package-lock.json files exist (e.g. ~/package-lock.json + this repo).
  // Wrong inference breaks CSS/module resolution and can duplicate React → runtime errors / missing styles.
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
