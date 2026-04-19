import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import * as Sentry from "@sentry/react";
import App from "./App";
import "./index.css";

// Initialize Sentry synchronously so it's ready before any user interaction
Sentry.init({
  dsn: "https://3aad5fac01fcd59243cc74a4d52bb5a0@o4510430501666816.ingest.us.sentry.io/4511229573464064",
  sendDefaultPii: true,
  tracesSampleRate: 0.1,
});

// Defer non-critical imports
const loadNonCriticalAssets = () => {
  // Load carousel styles asynchronously
  import("slick-carousel/slick/slick.css");
  import("slick-carousel/slick/slick-theme.css");

  // Load FontAwesome asynchronously
  import("@fortawesome/fontawesome-free");
};

// Load non-critical assets after initial render
setTimeout(loadNonCriticalAssets, 100);

// Use concurrent mode for better performance
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
);
