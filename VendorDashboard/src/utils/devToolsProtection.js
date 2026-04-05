// Developer tools and inspection protection utilities
import {
  shouldBlockDevTools,
  shouldDisableConsole,
  shouldDisableRightClick,
  shouldDisableShortcuts,
} from "../config/maintenance";

class DevToolsProtection {
  constructor() {
    this.isDevToolsOpen = false;
    this.devtools = { open: false, orientation: null };
    this.threshold = 160;
    this.redirectUrl = "about:blank";

    this.init();
  }

  init() {
    if (shouldBlockDevTools()) {
      this.detectDevTools();
      this.blockKeyboardShortcuts();
      this.disableRightClick();
      this.disableConsole();
      this.obfuscateCode();
      this.detectDebugger();
    }
  }

  // Disable and clear console
  disableConsole() {
    if (!shouldDisableConsole()) return;

    // Clear existing console logs
    if (typeof console.clear === "function") {
      console.clear();
    }

    // Override console methods
    const noop = () => {};
    const consoleMethods = [
      "log",
      "debug",
      "info",
      "warn",
      "error",
      "assert",
      "dir",
      "dirxml",
      "group",
      "groupEnd",
      "time",
      "timeEnd",
      "count",
      "trace",
      "profile",
      "profileEnd",
    ];

    consoleMethods.forEach((method) => {
      if (console[method]) {
        console[method] = noop;
      }
    });

    // Prevent console from being reassigned
    Object.defineProperty(window, "console", {
      value: console,
      writable: false,
      configurable: false,
    });

    // Clear console periodically
    setInterval(() => {
      try {
        console.clear();
      } catch (e) {}
    }, 1000);
  }

  // Detect developer tools opening
  detectDevTools() {
    const devtools = {
      open: false,
      orientation: null,
    };

    const threshold = this.threshold;

    setInterval(() => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold =
        window.outerHeight - window.innerHeight > threshold;
      const orientation = widthThreshold ? "vertical" : "horizontal";

      if (
        !(heightThreshold && widthThreshold) &&
        ((window.Firebug &&
          window.Firebug.chrome &&
          window.Firebug.chrome.isInitialized) ||
          widthThreshold ||
          heightThreshold)
      ) {
        if (!devtools.open || devtools.orientation !== orientation) {
          devtools.open = true;
          devtools.orientation = orientation;
          this.handleDevToolsDetected();
        }
      } else {
        devtools.open = false;
        devtools.orientation = null;
      }
    }, 500);

    // Additional detection methods
    this.detectConsoleAccess();
    this.detectElementInspection();
  }

  // Handle when developer tools are detected
  handleDevToolsDetected() {
    // Clear the page content
    document.body.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        font-family: Arial, sans-serif;
        color: white;
        text-align: center;
      ">
        <div>
          <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ Access Denied</h1>
          <p style="font-size: 1.1rem; margin-bottom: 2rem;">Developer tools detected. Page access has been restricted.</p>
          <p style="font-size: 0.9rem; opacity: 0.8;">Please close developer tools and refresh the page.</p>
        </div>
      </div>
    `;

    // Redirect after a delay
    setTimeout(() => {
      window.location.href = this.redirectUrl;
    }, 3000);
  }

  // Detect console access attempts
  detectConsoleAccess() {
    let devtools = { open: false };

    Object.defineProperty(devtools, "open", {
      get() {
        this.handleDevToolsDetected();
        return false;
      },
      configurable: false,
    });

    // Create a fake console object
    console.log("%cStop!", "color: red; font-size: 50px; font-weight: bold;");
    console.log(
      "%cThis is a browser feature intended for developers. If someone told you to copy-paste something here, it is a scam and will give them access to your account.",
      "font-size: 16px;"
    );
  }

  // Detect element inspection
  detectElementInspection() {
    document.addEventListener("contextmenu", (e) => {
      if (shouldDisableRightClick()) {
        e.preventDefault();
        return false;
      }
    });
  }

  // Block keyboard shortcuts
  blockKeyboardShortcuts() {
    if (!shouldDisableShortcuts()) return;

    document.addEventListener("keydown", (e) => {
      // F12
      if (e.keyCode === 123) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I (Inspector)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        return false;
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+C (Element Selector)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
        e.preventDefault();
        return false;
      }

      // Ctrl+S (Save Page)
      if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        return false;
      }

      // Ctrl+A (Select All)
      if (e.ctrlKey && e.keyCode === 65) {
        e.preventDefault();
        return false;
      }

      // Ctrl+P (Print)
      if (e.ctrlKey && e.keyCode === 80) {
        e.preventDefault();
        return false;
      }
    });
  }

  // Disable right-click context menu
  disableRightClick() {
    if (!shouldDisableRightClick()) return;

    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      return false;
    });

    // Disable drag and drop
    document.addEventListener("dragstart", (e) => {
      e.preventDefault();
      return false;
    });

    // Disable text selection
    document.addEventListener("selectstart", (e) => {
      e.preventDefault();
      return false;
    });

    // CSS to prevent text selection
    const style = document.createElement("style");
    style.innerHTML = `
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
    document.head.appendChild(style);
  }

  // Code obfuscation techniques
  obfuscateCode() {
    // Hide source code from view source
    const scripts = document.getElementsByTagName("script");
    for (let script of scripts) {
      if (script.src) {
        script.removeAttribute("src");
      }
    }

    // Add fake script tags to confuse
    const fakeScript = document.createElement("script");
    fakeScript.innerHTML = `
      // Obfuscated code - Do not modify
      const _0x1234 = ['log', 'warn', 'error'];
      (function(_0x5678, _0x9abc) {
        const _0xdef0 = function(_0x1111) {
          while (--_0x1111) {
            _0x5678['push'](_0x5678['shift']());
          }
        };
        _0xdef0(++_0x9abc);
      })(_0x1234, 0x86);
      // Security layer active
    `;
    document.head.appendChild(fakeScript);
  }

  // Detect debugger usage
  detectDebugger() {
    setInterval(() => {
      const start = performance.now();
      debugger; // This will pause if dev tools are open
      const end = performance.now();

      if (end - start > 100) {
        this.handleDevToolsDetected();
      }
    }, 1000);
  }

  // Disable common inspection methods
  disableInspectionMethods() {
    // Disable view source
    if (window.addEventListener) {
      window.addEventListener("beforeunload", () => {
        document.body.innerHTML = "Access Denied";
      });
    }

    // Override common inspection functions
    window.inspect = undefined;
    window.getEventListeners = undefined;
    window.getAccessibleRole = undefined;
    window.getAccessibleName = undefined;

    // Clear window properties that might be used for inspection
    delete window.chrome;
    delete window.process;
  }
}

// Initialize protection when DOM is ready
let protection = null;

export const initializeDevToolsProtection = () => {
  if (typeof window !== "undefined" && !protection) {
    protection = new DevToolsProtection();
  }
};

export const DevToolsBlocker = DevToolsProtection;

export default DevToolsProtection;
