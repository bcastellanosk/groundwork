import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// SPA mode: prerenders an index.html shell and disables Cloudflare Worker build
// so the app deploys as static files (Vercel, Netlify, any static host).
export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: { entry: "server" },
    spa: {
      enabled: true,
      maskPath: "/",
    },
  },
});
