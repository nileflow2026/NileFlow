const CACHE_PREFIX = "translations_cache_";
const LIBRE_TRANSLATE_URL = "https://libretranslate.com/translate";

/**
 * Translate a flat object of key→English strings into the target language.
 * Falls back to English values on any API failure.
 *
 * @param {string} targetLang - BCP-47 language code (e.g. "fr", "ar", "zu").
 * @param {Record<string, string>} baseTranslations - English key→value pairs.
 * @returns {Promise<Record<string, string>>}
 */
export async function getTranslations(targetLang, baseTranslations) {
  // Check localStorage cache first
  const cacheKey = `${CACHE_PREFIX}${targetLang}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Ignore cache read errors
  }

  try {
    const texts = Object.values(baseTranslations);
    const response = await fetch(LIBRE_TRANSLATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: texts,
        source: "en",
        target: targetLang,
        format: "text",
      }),
    });

    if (!response.ok) {
      return baseTranslations;
    }

    const { translatedText } = await response.json();
    if (!Array.isArray(translatedText)) {
      return baseTranslations;
    }

    const keys = Object.keys(baseTranslations);
    const translated = Object.fromEntries(
      keys.map((key, i) => [key, translatedText[i] ?? baseTranslations[key]]),
    );

    // Persist to cache
    try {
      localStorage.setItem(cacheKey, JSON.stringify(translated));
    } catch {
      // Storage quota exceeded — skip caching
    }

    return translated;
  } catch {
    return baseTranslations;
  }
}

/**
 * Remove all cached translations from localStorage.
 */
export function clearTranslationCache() {
  try {
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith(CACHE_PREFIX),
    );
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Ignore
  }
}
