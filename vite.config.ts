import { defineConfig } from "vite";
import { resolve } from "node:path";
import { globSync } from "tinyglobby";

export default defineConfig({
  root: "src/client",

  server: {
    middlewareMode: true,
  },
  appType: "mpa",
  build: {
    // Optional: Silence Sass deprecation warnings. See note below.
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: [
            "import",
            "mixed-decls",
            "color-functions",
            "global-builtin",
          ],
        },
      },
    },
    outDir: "../../dist",
    emptyOutDir: true,

    rollupOptions: {
      input: Object.fromEntries(
        globSync("src/client/**/*.html").map((file) => [
          file.slice("src/client/".length, -".html".length),
          resolve(import.meta.dirname, file),
        ]),
      ),
    },
  },
});
