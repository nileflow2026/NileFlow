import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SITE_URL = (
  process.env.VITE_SITE_URL || "https://nileflowafrica.com"
).replace(/\/$/, "");
const TODAY = new Date().toISOString().split("T")[0];

const STATIC_ROUTES = [
  "/",
  "/shop",
  "/deals",
  "/categories",
  "/about-us",
  "/contact",
  "/careers",
  "/help-center",
  "/return-policy",
  "/terms",
  "/privacy",
  "/discover",
  "/african-chronicles",
  "/premium-deals",
  "/featured-products",
  // "/search" intentionally omitted — interactive tool, no standalone content
];

const toAbsoluteUrl = (path) =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const normalizePath = (path) => {
  if (!path) return null;
  const safePath = `${path}`.trim();
  if (!safePath) return null;
  if (safePath.startsWith("http")) {
    return safePath.replace(/\/$/, "");
  }
  return toAbsoluteUrl(safePath.replace(/\/$/, ""));
};

const fetchJson = async (url) => {
  if (!url) return [];
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.products)) return data.products;
    if (Array.isArray(data?.categories)) return data.categories;
    return [];
  } catch {
    return [];
  }
};

const productPathFromItem = (item) => {
  if (!item || typeof item !== "object") return null;
  const id = item.$id || item.id || item.slug || item.productId;
  if (!id) return null;
  return `/products/${id}`;
};

const categoryPathFromItem = (item) => {
  if (!item || typeof item !== "object") return null;
  const id = item.$id || item.id || item.slug || item.categoryId || item.name;
  if (!id) return null;
  return `/categories/${String(id).trim()}`;
};

const createUrlNode = (loc, priority = "0.7", changefreq = "weekly") => {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
};

const buildSitemap = async () => {
  const productEndpoint =
    process.env.SITEMAP_PRODUCTS_ENDPOINT ||
    process.env.VITE_SITEMAP_PRODUCTS_ENDPOINT;
  const categoryEndpoint =
    process.env.SITEMAP_CATEGORIES_ENDPOINT ||
    process.env.VITE_SITEMAP_CATEGORIES_ENDPOINT;

  const [products, categories] = await Promise.all([
    fetchJson(productEndpoint),
    fetchJson(categoryEndpoint),
  ]);

  const urls = new Set();

  STATIC_ROUTES.forEach((route) => {
    urls.add(toAbsoluteUrl(route));
  });

  products
    .map(productPathFromItem)
    .filter(Boolean)
    .forEach((path) => {
      urls.add(normalizePath(path));
    });

  categories
    .map(categoryPathFromItem)
    .filter(Boolean)
    .forEach((path) => {
      urls.add(normalizePath(path));
    });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
    ...urls,
  ]
    .filter(Boolean)
    .sort()
    .map((url) => {
      const isHome = url === SITE_URL;
      const isProduct = url.includes("/products/");
      const isCategory =
        url.includes("/categories/") || url.endsWith("/categories");
      const priority = isHome
        ? "1.0"
        : isProduct
          ? "0.8"
          : isCategory
            ? "0.75"
            : "0.65";
      const changefreq = isHome || isProduct ? "daily" : "weekly";
      return createUrlNode(url, priority, changefreq);
    })
    .join("\n")}\n</urlset>\n`;

  const sitemapPath = resolve(process.cwd(), "public", "sitemap.xml");
  writeFileSync(sitemapPath, sitemap, "utf8");
  console.log(`Generated sitemap with ${urls.size} URLs at ${sitemapPath}`);
};

buildSitemap();
