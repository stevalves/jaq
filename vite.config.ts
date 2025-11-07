import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import type { ManifestOptions } from "vite-plugin-pwa";

const manifest = JSON.parse(
  readFileSync(
    new URL("./public/manifest.webmanifest", import.meta.url),
    "utf-8"
  )
) as ManifestOptions;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "icons/word-192.png",
        "icons/word-512.png",
        "icons/word-maskable-192.png",
        "icons/word-maskable-512.png",
        "icons/word-1024.png",
        "vite.svg",
      ],
      manifest,
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
      },
      devOptions: {
        enabled: true,
        suppressWarnings: true,
        navigateFallback: "index.html",
      },
    }),
  ],
});
