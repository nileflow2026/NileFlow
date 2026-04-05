/* eslint-disable no-unused-vars */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const config = {
    base: "/",
    plugins: [
      react({
        // Enable Fast Refresh in development
        fastRefresh: true,
      }),
      tailwindcss(),
    ],

    // Optimize build
    build: {
      // Reduce chunk size warnings
      chunkSizeWarningLimit: 600,

      // Enable compression
      minify: mode === "production" ? "terser" : false,
      terserOptions:
        mode === "production"
          ? {
              compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: [
                  "console.log",
                  "console.info",
                  "console.debug",
                  "console.trace",
                ],
              },
              mangle: true,
            }
          : undefined,

      // Aggressive code splitting
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching - prevent empty chunks
          manualChunks: (id) => {
            // Core React dependencies
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-core";
            }

            // Router and navigation
            if (id.includes("react-router")) {
              return "router";
            }

            // UI libraries
            if (
              id.includes("framer-motion") ||
              id.includes("react-modal") ||
              id.includes("react-toastify")
            ) {
              return "ui-lib";
            }

            // Icons and visual components
            if (
              id.includes("react-icons") ||
              id.includes("@fortawesome") ||
              id.includes("lucide-react")
            ) {
              return "icons";
            }

            // Carousel and sliders (only if they exist)
            if (
              id.includes("react-slick") ||
              id.includes("slick-carousel") ||
              id.includes("react-responsive-carousel")
            ) {
              return "carousel";
            }

            // API and data
            if (
              id.includes("axios") ||
              id.includes("appwrite") ||
              id.includes("socket.io-client")
            ) {
              return "api";
            }

            // Utilities and misc
            if (
              id.includes("jwt-decode") ||
              id.includes("i18n-js") ||
              id.includes("react-parallax")
            ) {
              return "utils";
            }

            // Stripe payment
            if (id.includes("@stripe/react-stripe-js")) {
              return "payment";
            }

            // Monitoring
            if (id.includes("@sentry/react")) {
              return "monitoring";
            }

            // Vendor chunks for node_modules
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },

          // Optimize asset filenames for caching
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId
                  .split("/")
                  .pop()
                  .replace(".jsx", "")
                  .replace(".js", "")
              : "chunk";
            return `assets/js/[name]-[hash].js`;
          },
          assetFileNames: (assetInfo) => {
            const extType = assetInfo.name.split(".").pop();
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(extType)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
        },
      },

      // Optimize assets
      assetsInlineLimit: 4096, // Inline small assets as base64
      cssCodeSplit: true,
      sourcemap: mode === "development", // Only in development

      // Rollup bundle analyzer
      ...(mode === "analyze" && {
        rollupOptions: {
          ...config.build?.rollupOptions,
          external: [],
          plugins: [],
        },
      }),
    },

    // Optimize dependencies
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "axios",
        "framer-motion",
      ],
    },

    // Enable gzip compression
    server: {
      cors: true,
    },

    // Define for better tree shaking
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      __DEV__: mode === "development",
    },
  };

  return config;
});
