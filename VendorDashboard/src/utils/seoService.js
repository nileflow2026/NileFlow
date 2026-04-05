/**
 * seoService.js
 * SEO Intelligence Engine for Nile Flow Vendor Dashboard
 *
 * Purpose: Help vendors create SEO-optimized product listings for the
 *          public storefront. This dashboard itself is NOT indexed.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const TITLE_MIN = 20;
const TITLE_MAX = 70;
const DESC_MIN = 80;
const DESC_MAX = 160;
const SLUG_MAX = 60;

/**
 * High-value e-commerce keyword modifiers used to boost conversions & rankings
 * on the public storefront.
 */
const POWER_WORDS = [
  "best",
  "premium",
  "quality",
  "authentic",
  "original",
  "genuine",
  "affordable",
  "cheap",
  "discount",
  "sale",
  "new",
  "durable",
  "lightweight",
  "portable",
  "wireless",
  "waterproof",
  "fast",
  "quick",
  "easy",
  "professional",
  "handmade",
  "handcrafted",
  "organic",
  "natural",
  "eco",
  "sustainable",
  "popular",
  "trending",
  "top",
  "luxury",
  "stylish",
  "modern",
  "classic",
  "vintage",
  "smart",
  "heavy",
  "slim",
  "compact",
  "multi",
  "ultra",
];

/** Words that weaken SEO — vague, filler, or over-used */
const WEAK_WORDS = [
  "thing",
  "stuff",
  "item",
  "product",
  "good",
  "nice",
  "great",
  "amazing",
  "awesome",
  "very",
  "really",
  "just",
  "basically",
  "literally",
  "honestly",
];

/** Stop words — ignored when extracting meaningful keywords */
const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "is",
  "it",
  "its",
  "are",
  "was",
  "were",
  "be",
  "been",
  "has",
  "have",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "can",
  "could",
  "that",
  "this",
  "these",
  "those",
  "as",
  "up",
  "out",
  "so",
  "into",
  "also",
  "than",
  "then",
  "not",
  "no",
  "only",
  "more",
  "most",
  "some",
  "any",
  "all",
  "your",
  "our",
  "their",
  "we",
  "you",
  "i",
  "he",
  "she",
  "they",
  "my",
  "his",
  "her",
]);

// ─── Core helpers ──────────────────────────────────────────────────────────────

/**
 * Tokenise text into meaningful lowercase words, removing stop words.
 * @param {string} text
 * @returns {string[]}
 */
function tokenize(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Find duplicate or near-duplicate phrases (trigrams) in text.
 * @param {string} text
 * @returns {string[]} repeated phrases
 */
function findDuplicatePhrases(text = "") {
  const words = text.toLowerCase().split(/\s+/);
  const trigrams = {};
  const dupes = [];

  for (let i = 0; i <= words.length - 3; i++) {
    const tri = words.slice(i, i + 3).join(" ");
    if (trigrams[tri]) {
      if (!dupes.includes(tri)) dupes.push(tri);
    } else {
      trigrams[tri] = true;
    }
  }
  return dupes;
}

// ─── Slug generation ───────────────────────────────────────────────────────────

/**
 * Generate an SEO-friendly URL slug from a product title.
 * @param {string} title
 * @returns {string}
 */
export function generateSlug(title = "") {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, SLUG_MAX);
}

// ─── Meta generation ──────────────────────────────────────────────────────────

/**
 * Auto-generate a meta title (≤70 chars) from product fields.
 * @param {{name: string, brand?: string, category?: string}} product
 * @returns {string}
 */
export function generateMetaTitle({ name = "", brand = "", category = "" }) {
  const parts = [name.trim()];
  if (brand && brand.trim()) parts.push(`by ${brand.trim()}`);
  if (category && category.trim()) parts.push(`| ${category.trim()}`);
  return parts.join(" ").slice(0, TITLE_MAX);
}

/**
 * Auto-generate a meta description (≤160 chars) from product fields.
 * @param {{name: string, shortDescription?: string, description?: string, brand?: string}} product
 * @returns {string}
 */
export function generateMetaDescription({
  name = "",
  shortDescription = "",
  description = "",
  brand = "",
}) {
  const base =
    shortDescription.trim() ||
    description.trim().slice(0, 120) ||
    `Buy ${name.trim()}${brand ? ` by ${brand.trim()}` : ""} online. Premium quality, fast delivery.`;

  return base.slice(0, DESC_MAX);
}

/**
 * Auto-generate an `alt` text string for an image.
 * @param {{name: string, brand?: string}} product
 * @returns {string}
 */
export function generateAltText({ name = "", brand = "" }) {
  const parts = [name.trim()];
  if (brand && brand.trim()) parts.push(brand.trim());
  return parts.join(" ").slice(0, 125);
}

/**
 * Generate an SEO-optimised filename for an image.
 * @param {string} productName
 * @param {number} [index=0]  0 = primary image, 1+ = additional images
 * @returns {string}  e.g. "leather-wallet-1.jpg"
 */
export function generateImageFilename(productName = "", index = 0) {
  const base = generateSlug(productName);
  const suffix = index === 0 ? "" : `-${index}`;
  return `${base}${suffix}.jpg`;
}

// ─── Keyword extraction ────────────────────────────────────────────────────────

/**
 * Extract meaningful keyword suggestions from product fields.
 * @param {{name: string, description?: string, brand?: string, tags?: string, category?: string}} product
 * @returns {string[]}
 */
export function extractKeywords({
  name = "",
  description = "",
  brand = "",
  tags = "",
  category = "",
}) {
  const combined = [name, description, brand, tags, category].join(" ");
  const tokens = tokenize(combined);

  // Frequency count
  const freq = {};
  for (const t of tokens) {
    freq[t] = (freq[t] || 0) + 1;
  }

  // Sort by frequency, boost power words
  return Object.entries(freq)
    .sort(([aWord, aCount], [bWord, bCount]) => {
      const aBoost = POWER_WORDS.includes(aWord) ? 2 : 0;
      const bBoost = POWER_WORDS.includes(bWord) ? 2 : 0;
      return bCount + bBoost - (aCount + aBoost);
    })
    .slice(0, 15)
    .map(([word]) => word);
}

// ─── SEO Analysis ─────────────────────────────────────────────────────────────

/**
 * Full SEO analysis of a product.
 *
 * @param {{
 *   name: string,
 *   shortDescription?: string,
 *   description?: string,
 *   brand?: string,
 *   tags?: string,
 *   category?: string,
 *   seoTitle?: string,
 *   seoDescription?: string,
 *   image?: string,
 *   images?: string[]
 * }} product
 *
 * @returns {{
 *   score: number,           // 0–100
 *   grade: string,           // A+ / A / B / C / D / F
 *   suggestions: string[],   // actionable tips
 *   issues: string[],        // things that need fixing
 *   positives: string[],     // what's already good
 *   missingKeywords: string[],
 *   weakWords: string[],
 *   duplicatePhrases: string[],
 *   autoFills: {
 *     metaTitle: string,
 *     metaDescription: string,
 *     slug: string,
 *     keywords: string[]
 *   }
 * }}
 */
export function analyzeProductSEO(product) {
  const {
    name = "",
    shortDescription = "",
    description = "",
    brand = "",
    tags = "",
    category = "",
    seoTitle = "",
    seoDescription = "",
    image = "",
    images = [],
  } = product;

  const issues = [];
  const suggestions = [];
  const positives = [];
  let score = 0;

  // ── 1. Product name (25 pts) ──────────────────────────────────────────────
  if (!name.trim()) {
    issues.push("Product name is required.");
  } else if (name.length < TITLE_MIN) {
    issues.push(
      `Product name is too short (${name.length} chars). Aim for at least ${TITLE_MIN} characters.`
    );
    score += 8;
  } else if (name.length > TITLE_MAX) {
    issues.push(
      `Product name is too long (${name.length} chars). Keep it under ${TITLE_MAX} characters.`
    );
    score += 15;
  } else {
    positives.push("Product name length is optimal.");
    score += 25;
  }

  const nameTokens = tokenize(name);
  const hasPowerWord = nameTokens.some((w) => POWER_WORDS.includes(w));
  if (!hasPowerWord && name.trim().length > 0) {
    suggestions.push(
      `Add a power word to your product name (e.g. "Premium", "Authentic", "Lightweight").`
    );
  } else if (hasPowerWord) {
    positives.push("Product name contains a descriptive power word.");
    score += 5;
  }

  // ── 2. Description (25 pts) ───────────────────────────────────────────────
  const descText = (shortDescription || description).trim();
  if (!descText) {
    issues.push("Add a product description to improve search visibility.");
  } else if (descText.length < DESC_MIN) {
    issues.push(
      `Description is too short (${descText.length} chars). Aim for at least ${DESC_MIN} characters.`
    );
    score += 8;
  } else {
    positives.push("Description length is good.");
    score += description.length >= 200 ? 25 : 18;
  }

  // Weak words in description
  const descTokens = tokenize(descText);
  const foundWeakWords = descTokens.filter((w) => WEAK_WORDS.includes(w));
  if (foundWeakWords.length > 0) {
    suggestions.push(
      `Replace weak/vague words in your description: "${foundWeakWords.slice(0, 3).join('", "')}".`
    );
  }

  // Duplicate phrases
  const combinedText = `${name} ${descText}`;
  const dupes = findDuplicatePhrases(combinedText);
  if (dupes.length > 0) {
    suggestions.push(
      `Repetitive phrasing detected: "${dupes[0]}". Vary your wording for better readability.`
    );
  }

  // ── 3. SEO / Meta fields (20 pts) ─────────────────────────────────────────
  const effectiveTitle = seoTitle.trim() || name.trim();
  if (!seoTitle.trim()) {
    suggestions.push(
      'Add a custom SEO Title (or leave blank to use product name). Consider: "' +
        generateMetaTitle({ name, brand, category }) +
        '"'
    );
    score += 5;
  } else if (seoTitle.length < TITLE_MIN || seoTitle.length > TITLE_MAX) {
    issues.push(
      `SEO Title should be ${TITLE_MIN}–${TITLE_MAX} characters (currently ${seoTitle.length}).`
    );
    score += 8;
  } else {
    positives.push("SEO Title length is ideal.");
    score += 10;
  }

  if (!seoDescription.trim()) {
    suggestions.push(
      'Add a Meta Description. Suggested: "' +
        generateMetaDescription({ name, shortDescription, description, brand }) +
        '"'
    );
    score += 3;
  } else if (
    seoDescription.length < DESC_MIN ||
    seoDescription.length > DESC_MAX
  ) {
    issues.push(
      `Meta Description should be ${DESC_MIN}–${DESC_MAX} characters (currently ${seoDescription.length}).`
    );
    score += 5;
  } else {
    positives.push("Meta Description length is perfect.");
    score += 10;
  }

  // ── 4. Tags / Keywords (15 pts) ────────────────────────────────────────────
  const tagsArray = tags
    ? tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  if (tagsArray.length === 0) {
    issues.push("Add product tags / keywords to improve discoverability.");
  } else if (tagsArray.length < 3) {
    suggestions.push("Add more tags — aim for at least 5 relevant keywords.");
    score += 7;
  } else {
    positives.push(`Good — ${tagsArray.length} tags / keywords provided.`);
    score += tagsArray.length >= 5 ? 15 : 10;
  }

  // ── 5. Category (5 pts) ───────────────────────────────────────────────────
  if (!category.trim()) {
    issues.push("Select a category to help customers find your product.");
  } else {
    positives.push("Category assigned.");
    score += 5;
  }

  // ── 6. Image (10 pts) ─────────────────────────────────────────────────────
  if (!image.trim()) {
    issues.push("Upload a primary product image. Images are critical for CTR.");
  } else {
    positives.push("Primary image present.");
    score += images.length > 0 ? 10 : 6;
    if (images.length === 0) {
      suggestions.push(
        "Add multiple product images to increase buyer confidence."
      );
    }
  }

  // ── Missing keywords check ─────────────────────────────────────────────────
  const extracted = extractKeywords({ name, description, brand, tags, category });
  const titleTokens = tokenize(effectiveTitle);
  const missingKeywords = extracted
    .slice(0, 5)
    .filter((kw) => !titleTokens.includes(kw) && !seoDescription.toLowerCase().includes(kw));

  if (missingKeywords.length > 0) {
    suggestions.push(
      `Consider adding these keywords to your SEO fields: "${missingKeywords.join('", "')}".`
    );
  }

  // ── Cap score ─────────────────────────────────────────────────────────────
  score = Math.min(100, Math.round(score));

  // ── Grade ─────────────────────────────────────────────────────────────────
  let grade;
  if (score >= 90) grade = "A+";
  else if (score >= 80) grade = "A";
  else if (score >= 70) grade = "B";
  else if (score >= 55) grade = "C";
  else if (score >= 40) grade = "D";
  else grade = "F";

  // ── Auto-fills ────────────────────────────────────────────────────────────
  const autoFills = {
    metaTitle: generateMetaTitle({ name, brand, category }),
    metaDescription: generateMetaDescription({ name, shortDescription, description, brand }),
    slug: generateSlug(name),
    keywords: extracted,
  };

  return {
    score,
    grade,
    suggestions,
    issues,
    positives,
    missingKeywords,
    weakWords: foundWeakWords,
    duplicatePhrases: dupes,
    autoFills,
  };
}
