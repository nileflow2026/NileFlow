import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Hook to set canonical URL for SEO
 * Automatically adds/updates the canonical meta tag for the current page
 * @param {string} overrideUrl - Optional override URL (useful for dynamic content)
 */
export const useCanonical = (overrideUrl = null) => {
  const location = useLocation();

  useEffect(() => {
    // Get the canonical URL
    const canonicalUrl =
      overrideUrl || `${window.location.origin}${location.pathname}`;

    // Remove existing canonical tag if present
    let canonical = document.querySelector("link[rel='canonical']");
    if (canonical) {
      canonical.remove();
    }

    // Create and add new canonical tag
    const link = document.createElement("link");
    link.rel = "canonical";
    link.href = canonicalUrl;
    document.head.appendChild(link);

    return () => {
      // Cleanup is handled by replacing the tag above
    };
  }, [location.pathname, overrideUrl]);
};

export default useCanonical;
