// Immediate protection - runs before React loads
// This script should be loaded in index.html to provide instant protection

(function () {
  "use strict";

  // Configuration
  const PROTECTION_ENABLED = true;

  if (!PROTECTION_ENABLED) return;

  // Immediate console disabling
  const originalConsole = window.console;
  window.console = {
    log: function () {},
    debug: function () {},
    info: function () {},
    warn: function () {},
    error: function () {},
    assert: function () {},
    dir: function () {},
    dirxml: function () {},
    group: function () {},
    groupEnd: function () {},
    time: function () {},
    timeEnd: function () {},
    count: function () {},
    trace: function () {},
    profile: function () {},
    profileEnd: function () {},
    clear: function () {},
  };

  // Make console non-configurable
  Object.defineProperty(window, "console", {
    value: window.console,
    writable: false,
    configurable: false,
  });

  // Immediate right-click protection
  document.addEventListener(
    "contextmenu",
    function (e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    },
    true,
  );

  // Immediate key blocking
  document.addEventListener(
    "keydown",
    function (e) {
      // F12
      if (e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (
        e.ctrlKey &&
        e.shiftKey &&
        (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+S (Save)
      if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+A (Select All)
      if (e.ctrlKey && e.keyCode === 65) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    },
    true,
  );

  // Immediate text selection blocking
  document.addEventListener(
    "selectstart",
    function (e) {
      e.preventDefault();
      return false;
    },
    true,
  );

  // Block drag operations
  document.addEventListener(
    "dragstart",
    function (e) {
      e.preventDefault();
      return false;
    },
    true,
  );

  // DevTools detection with immediate response
  let devToolsOpen = false;

  function detectDevTools() {
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (!devToolsOpen && (widthThreshold || heightThreshold)) {
      devToolsOpen = true;
      handleDevToolsDetected();
    }
  }

  function handleDevToolsDetected() {
    // Replace entire page content
    document.documentElement.innerHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Access Denied</title>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            user-select: none;
          }
          .container { max-width: 500px; padding: 2rem; }
          h1 { font-size: 3rem; margin-bottom: 1rem; }
          p { font-size: 1.2rem; line-height: 1.5; margin-bottom: 1rem; }
          .warning { font-size: 4rem; margin-bottom: 2rem; }
          .code { font-family: monospace; background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="warning">⚠️</div>
          <h1>Access Denied</h1>
          <p>Developer tools have been detected.</p>
          <p>This page is protected against inspection.</p>
          <div class="code">Error Code: DEV_TOOLS_BLOCKED</div>
        </div>
        <script>
          // Prevent any further access
          setInterval(() => {
            if (window.outerWidth - window.innerWidth > 160 || 
                window.outerHeight - window.innerHeight > 160) {
              window.location.href = 'about:blank';
            }
          }, 100);
          
          // Block all keyboard events
          document.addEventListener('keydown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }, true);
          
          // Block context menu
          document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
          }, true);
        </script>
      </body>
      </html>
    `;

    // Redirect after 3 seconds
    setTimeout(() => {
      window.location.href = "about:blank";
    }, 3000);
  }

  // Debugger detection
  function debuggerDetection() {
    const start = performance.now();
    debugger;
    const end = performance.now();

    if (end - start > 100) {
      handleDevToolsDetected();
    }
  }

  // Console access detection
  Object.defineProperty(window, "console", {
    get() {
      handleDevToolsDetected();
      return originalConsole;
    },
    set() {
      handleDevToolsDetected();
    },
  });

  // Start monitoring when page loads
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      // Start continuous monitoring
      setInterval(detectDevTools, 500);
      setInterval(debuggerDetection, 1000);
    });
  } else {
    // Start monitoring immediately if page already loaded
    setInterval(detectDevTools, 500);
    setInterval(debuggerDetection, 1000);
  }

  // Additional protection against common inspection methods
  window.addEventListener("resize", detectDevTools);

  // Block common inspection globals
  delete window.chrome;
  delete window.process;

  // Override potential inspection functions
  window.inspect = undefined;
  window.getEventListeners = undefined;

  // Add CSS to prevent selection immediately
  const style = document.createElement("style");
  style.textContent = `
    * {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
      -webkit-touch-callout: none !important;
      -webkit-tap-highlight-color: transparent !important;
    }
    input, textarea {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
    }
  `;

  if (document.head) {
    document.head.appendChild(style);
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      document.head.appendChild(style);
    });
  }
})();
