import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { matchPath, useLocation } from "react-router-dom";
import {
  SITE_NAME,
  SITE_URL,
  DEFAULT_OG_IMAGE,
  DEFAULT_SEO,
  ROUTE_SEO,
  buildAbsoluteUrl,
  humanizePath,
} from "../seo/seoConfig";

const normalizePathForCanonical = (pathname) => {
  if (!pathname || pathname === "/home") {
    return "/";
  }
  return pathname;
};

const removeTrailingSlash = (value) => {
  if (!value) return value;
  if (value.length > 1 && value.endsWith("/")) {
    return value.slice(0, -1);
  }
  return value;
};

const getRouteMeta = (pathname) => {
  const matched = ROUTE_SEO.find((route) =>
    matchPath({ path: route.pattern, end: true }, pathname),
  );

  if (matched) {
    return matched;
  }

  return {
    ...DEFAULT_SEO,
    title: humanizePath(pathname),
    canonicalPath: pathname,
  };
};

const buildWebSiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

const buildOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/new1.png`,
  description:
    "Nile Flow Africa is a premium African e-commerce marketplace connecting buyers with authentic products.",
});

const buildBreadcrumbSchema = (pathname) => {
  const segments = pathname.split("/").filter(Boolean);

  const itemListElement = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
  ];

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const name = segment
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    itemListElement.push({
      "@type": "ListItem",
      position: index + 2,
      name,
      item: `${SITE_URL}${currentPath}`,
    });
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
};

const SeoHead = ({
  title,
  description,
  canonicalPath,
  ogImage,
  type,
  noindex,
  structuredData,
  prevPagePath,
  nextPagePath,
}) => {
  const location = useLocation();
  const pathname = normalizePathForCanonical(location.pathname);

  const meta = useMemo(() => {
    const routeMeta = getRouteMeta(pathname);

    const resolvedTitle = title || routeMeta.title || DEFAULT_SEO.title;
    const resolvedDescription =
      description || routeMeta.description || DEFAULT_SEO.description;

    const canonical =
      canonicalPath ??
      routeMeta.canonicalPath ??
      removeTrailingSlash(`${pathname}${location.search ? "" : ""}`);

    const resolvedCanonicalPath = removeTrailingSlash(canonical || pathname);
    const canonicalUrl = buildAbsoluteUrl(
      resolvedCanonicalPath === "" ? "/" : resolvedCanonicalPath,
    );

    return {
      title: resolvedTitle,
      description: resolvedDescription,
      type: type || routeMeta.type || DEFAULT_SEO.type,
      canonicalUrl,
      robots:
        (noindex ?? routeMeta.noindex) ? "noindex, nofollow" : "index, follow",
      image: ogImage || DEFAULT_OG_IMAGE,
    };
  }, [
    canonicalPath,
    description,
    location.search,
    noindex,
    ogImage,
    pathname,
    title,
    type,
  ]);

  const schemas = useMemo(() => {
    const data = [buildOrganizationSchema(), buildWebSiteSchema()];

    if (pathname !== "/") {
      data.push(buildBreadcrumbSchema(pathname));
    }

    if (structuredData) {
      if (Array.isArray(structuredData)) {
        data.push(...structuredData);
      } else {
        data.push(structuredData);
      }
    }

    return data;
  }, [pathname, structuredData]);

  return (
    <Helmet prioritizeSeoTags>
      <html lang="en" />
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="robots" content={meta.robots} />
      <link rel="canonical" href={meta.canonicalUrl} />
      {prevPagePath ? (
        <link rel="prev" href={buildAbsoluteUrl(prevPagePath)} />
      ) : null}
      {nextPagePath ? (
        <link rel="next" href={buildAbsoluteUrl(nextPagePath)} />
      ) : null}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:type" content={meta.type} />
      <meta property="og:url" content={meta.canonicalUrl} />
      <meta property="og:image" content={meta.image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />

      {schemas.map((schema, index) => (
        <script key={`schema-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SeoHead;
