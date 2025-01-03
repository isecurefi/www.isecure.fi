import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.isecure.fi",
  base: "/",
  build: {
    sourcemap: false,
  },
  integrations: [sitemap()],
  vite: {
    build: {
      cssCodeSplit: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["bootstrap"],
            utils: ["./src/utils/"],
          },
        },
      },
    },
    css: {
      devSourcemap: process.env.NODE_ENV === "development",
    },
    ssr: {
      noExternal: ["bootstrap"],
    },
  },
});
