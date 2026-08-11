import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.isecure.fi",
  base: "/",
  build: {
    sourcemap: false,
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes("/thankyou/") &&
        !page.includes("/daily-cash/") &&
        !page.includes("/ws-api/") &&
        !page.includes("/ws-channel/") &&
        !page.includes("/images/logo-candidates/"),
    }),
  ],
  vite: {
    build: {
      cssCodeSplit: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/bootstrap")) return "vendor";
            if (id.includes("/src/utils/")) return "utils";
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
