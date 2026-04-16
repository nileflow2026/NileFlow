/**
 * prerender.mjs
 *
 * Lightweight static pre-rendering for nileflowafrica.com (Vite + React SPA).
 * Runs after `vite build`. For every public route it:
 *  1. Reads dist/index.html
 *  2. Replaces <title>, <meta name="description">, <meta name="robots">,
 *     <link rel="canonical">, and the main OG tags with route-specific values
 *  3. Writes the result to dist/<route>/index.html
 *
 * This means Google sees real HTML (title + description) immediately —
 * without needing to execute JavaScript — resolving "Discovered - not indexed".
 *
 * No puppeteer, no headless browser, no server required.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "..", "dist");
const SITE_URL = "https://nileflowafrica.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

// ── Route definitions ──────────────────────────────────────────────────────
// Mirror of seoConfig.js ROUTE_SEO — only indexable public routes.
const ROUTES = [
  {
    path: "/",
    title: "Nile Flow Africa | Premium African E-commerce",
    description:
      "Shop premium African products, discover artisan stories, and experience authentic commerce from across Africa.",
    type: "website",
  },
  {
    path: "/shop",
    title: "Shop Authentic African Products | Nile Flow Africa",
    description:
      "Browse curated African products, crafts, fashion, and premium collections from trusted vendors.",
  },
  {
    path: "/deals",
    title: "Best Deals on African Products | Nile Flow Africa",
    description:
      "Explore limited-time deals and exclusive offers on authentic African products.",
  },
  {
    path: "/categories",
    title: "Product Categories | Nile Flow Africa",
    description:
      "Explore categories of African products, from handmade crafts to fashion and cultural essentials.",
  },
  {
    path: "/contact",
    title: "Contact Nile Flow Africa",
    description:
      "Contact Nile Flow Africa support for help with products, orders, and marketplace inquiries.",
  },
  {
    path: "/about-us",
    title: "About Nile Flow Africa",
    description:
      "Learn about Nile Flow Africa, our mission, and our commitment to authentic African commerce.",
  },
  {
    path: "/help-center",
    title: "Help Center | Nile Flow Africa",
    description:
      "Find answers to frequently asked questions about orders, returns, payments, and account support.",
  },
  {
    path: "/return-policy",
    title: "Return Policy | Nile Flow Africa",
    description:
      "Read Nile Flow Africa's return and refund policy for marketplace purchases.",
  },
  {
    path: "/terms",
    title: "Terms of Service | Nile Flow Africa",
    description:
      "Review Nile Flow Africa terms and conditions for using our marketplace platform.",
  },
  {
    path: "/privacy",
    title: "Privacy Policy | Nile Flow Africa",
    description:
      "Understand how Nile Flow Africa collects, processes, and protects your personal data.",
  },
  {
    path: "/discover",
    title: "Discover Africa | Nile Flow Africa",
    description:
      "Explore African culture, stories, and curated discoveries alongside authentic marketplace products.",
  },
  {
    path: "/african-chronicles",
    title: "African Chronicles | Nile Flow Africa",
    description:
      "Read inspiring African stories, heritage content, and community-driven chronicles.",
  },
  {
    path: "/premium-deals",
    title: "Premium Deals | Nile Flow Africa",
    description:
      "Unlock premium marketplace deals and special pricing for selected African products.",
  },
  {
    path: "/featured-products",
    title: "Featured Products | Nile Flow Africa",
    description:
      "Shop trending and featured products selected by Nile Flow Africa.",
  },
  {
    path: "/careers",
    title: "Careers | Nile Flow Africa",
    description:
      "Join Nile Flow Africa and help shape the future of African e-commerce.",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function escapeAttr(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function setMeta(html, name, content) {
  const escaped = escapeAttr(content);
  const re = new RegExp(`<meta\\s+name=["']${name}["'][^>]*>`, "i");
  if (re.test(html)) {
    return html.replace(re, `<meta name="${name}" content="${escaped}" />`);
  }
  // insert before </head> if tag doesn't exist
  return html.replace(
    "</head>",
    `  <meta name="${name}" content="${escaped}" />\n</head>`,
  );
}

function setProperty(html, property, content) {
  const escaped = escapeAttr(content);
  const re = new RegExp(`<meta\\s+property=["']${property}["'][^>]*>`, "i");
  if (re.test(html)) {
    return html.replace(
      re,
      `<meta property="${property}" content="${escaped}" />`,
    );
  }
  return html.replace(
    "</head>",
    `  <meta property="${property}" content="${escaped}" />\n</head>`,
  );
}

function setCanonical(html, url) {
  const escaped = escapeAttr(url);
  const re = /<link\s+rel=["']canonical["'][^>]*>/i;
  if (re.test(html)) {
    return html.replace(re, `<link rel="canonical" href="${escaped}" />`);
  }
  return html.replace(
    "</head>",
    `  <link rel="canonical" href="${escaped}" />\n</head>`,
  );
}

function setTitle(html, title) {
  const escaped = title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  if (/<title>/i.test(html)) {
    return html.replace(/<title>.*?<\/title>/is, `<title>${escaped}</title>`);
  }
  return html.replace("</head>", `  <title>${escaped}</title>\n</head>`);
}

// ── Main ───────────────────────────────────────────────────────────────────

const templatePath = path.join(DIST, "index.html");

if (!fs.existsSync(templatePath)) {
  console.error(
    "❌  dist/index.html not found. Run `vite build` before pre-rendering.",
  );
  process.exit(1);
}

const template = fs.readFileSync(templatePath, "utf-8");
let count = 0;

for (const route of ROUTES) {
  const canonicalUrl =
    route.path === "/" ? SITE_URL : `${SITE_URL}${route.path}`;
  const ogType = route.type || "website";

  let html = template;
  html = setTitle(html, route.title);
  html = setMeta(html, "description", route.description);
  html = setMeta(html, "robots", "index, follow");
  html = setCanonical(html, canonicalUrl);

  // Open Graph
  html = setProperty(html, "og:title", route.title);
  html = setProperty(html, "og:description", route.description);
  html = setProperty(html, "og:type", ogType);
  html = setProperty(html, "og:url", canonicalUrl);
  html = setProperty(html, "og:image", DEFAULT_OG_IMAGE);

  // Twitter card
  html = setMeta(html, "twitter:title", route.title);
  html = setMeta(html, "twitter:description", route.description);

  // Write file
  const outDir =
    route.path === "/"
      ? DIST
      : path.join(DIST, ...route.path.split("/").filter(Boolean));

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html, "utf-8");
  count++;
  console.log(`  ✓  ${route.path}`);
}

console.log(`\n✅  Pre-rendered ${count} routes into dist/\n`);
