import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execSync } from "child_process";

// Auto-detect the current git commit SHA for cache-busting.
// Falls back to a timestamp so local/non-git builds always get a unique version.
const getAppVersion = () => {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return Date.now().toString();
  }
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Injected at build time — no manual .env editing required.
    __APP_VERSION__: JSON.stringify(getAppVersion()),
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
  build: {
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]",
      },
    },
  },
});
