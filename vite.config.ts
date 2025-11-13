import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'manifest.json', 'offline.html', 'assets/**/*'],
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}'],
      },
      // Use existing manifest.json from public folder instead of generating one
      manifest: false,
      useCredentials: false,
      devOptions: {
        enabled: false, // Disable in development to avoid conflicts
        type: 'module'
      },
      // Use inline registration so PWABuilder can detect it in HTML
      injectRegister: 'inline',
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: mode === "production" ? "/kotsu-sensei-practice/" : "/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
}));
