import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname, // its own app, even while it lives inside the studio repo
    // pdf.js legacy build: the modern one needs browser features older phones and Safari lack
    resolveAlias: { "pdfjs-dist": "pdfjs-dist/legacy/build/pdf.mjs" },
  },
};

export default nextConfig;
