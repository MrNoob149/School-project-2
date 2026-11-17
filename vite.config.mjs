import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const translationProxy = {
  target: "http://127.0.0.1:5000",
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/api/, ""),
};

export default defineConfig({
  root: resolve(projectRoot, "trash"),
  plugins: [tailwindcss()],
  server: {
    proxy: {
      "/api/translate": translationProxy,
    },
  },
  preview: {
    proxy: {
      "/api/translate": translationProxy,
    },
  },
  build: {
    outDir: resolve(projectRoot, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(projectRoot, "trash", "main.html"),
    },
  },
});
