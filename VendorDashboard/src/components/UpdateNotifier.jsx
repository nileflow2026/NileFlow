import { Component, useEffect, useState } from "react";
import { checkForUpdate } from "../core/versionManager";

const CHECK_INTERVAL_MS = 60_000; // 60 seconds

function UpdateBanner() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const result = await checkForUpdate();
      if (cancelled) return;

      if (result.hasUpdate) {
        if (result.force) {
          window.location.reload();
          return;
        }
        setUpdateAvailable(true);
      }
    }

    poll();
    const id = setInterval(poll, CHECK_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!updateAvailable) return null;

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        right: 20,
        background: "#111827",
        color: "#f9fafb",
        padding: "12px 16px",
        borderRadius: "8px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
      }}
    >
      <span style={{ fontSize: "14px" }}>
        A new version of the vendor dashboard is available.
      </span>
      <button
        onClick={() => window.location.reload()}
        style={{
          background: "#f59e0b",
          color: "#111827",
          border: "none",
          borderRadius: "6px",
          padding: "6px 14px",
          fontWeight: 700,
          cursor: "pointer",
          fontSize: "13px",
          whiteSpace: "nowrap",
        }}
      >
        Update now
      </button>
    </div>
  );
}

// Error boundary ensures a crash inside UpdateBanner never blanks the whole app.
class UpdateNotifierBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { crashed: false };
  }
  static getDerivedStateFromError() {
    return { crashed: true };
  }
  componentDidCatch(err) {
    console.error("[UpdateNotifier] Isolated error:", err);
  }
  render() {
    if (this.state.crashed) return null;
    return this.props.children;
  }
}

export default function UpdateNotifier() {
  return (
    <UpdateNotifierBoundary>
      <UpdateBanner />
    </UpdateNotifierBoundary>
  );
}
