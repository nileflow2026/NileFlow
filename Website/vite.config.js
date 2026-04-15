/* eslint-disable no-unused-vars */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Packages that live exclusively on the server and must NEVER enter the browser bundle.
// Keeping them here makes the intent explicit and helps Rollup skip them during tree-shaking.
const SERVER_ONLY_PACKAGES = [
  "ioredis",   // Redis client – Node.js only
  "web-push",  // Push-notification server library – Node.js only
  "crypto",    // Shadowed by a stub that re-exports the Node built-in – not needed in browser
  // "install" and "npm" are tooling packages with no import in frontend code;
  // Rollup's tree-shaking already skips them, but listing here is defensive.
];

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
                passes: 2,       // Extra pass for smaller output
              },
              mangle: true,
            }
          : undefined,

      // Aggressive code splitting
      rollupOptions: {
        // Exclude server-only packages from the browser bundle entirely.
        // Without this, Rollup would attempt to resolve them and either fail
        // or include large Node.js-only code paths.
        external: SERVER_ONLY_PACKAGES,
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

            // Monitoring (loaded async in main.jsx — keep isolated)
            if (id.includes("@sentry/react")) {
              return "monitoring";
            }

            // Vendor chunks for node_modules
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },

          // Optimize asset filenames for long-term caching
          chunkFileNames: () => `assets/js/[name]-[hash].js`,
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

      // Inline assets smaller than 8 KB as base64 to save a round-trip request.
      // Essential for low-bandwidth African markets (fewer HTTP requests = faster load).
      assetsInlineLimit: 8192,
      cssCodeSplit: true,
      sourcemap: mode === "development", // Only in development
    },

    // Pre-bundle critical deps so the browser receives a single optimised file
    // instead of hundreds of small module requests during dev.
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "axios",
        "framer-motion",
        "react-toastify",
        "lucide-react",
      ],
      // Exclude server-only packages from Vite's dep-scanning entirely to
      // prevent "Cannot find module" errors during development startup.
      exclude: SERVER_ONLY_PACKAGES,
    },

    // Enable CORS in development
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
