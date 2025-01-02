import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.isecure.fi",
  base: "/",
  build: {
    sourcemap: false,
  },
  integrations: [sitemap()],
});
