import { I18n } from "i18n-js";

import en from "./locales/en.json";
import kis from "./locales/kis.json";
import { getTranslations } from "./utils/translationService";

const LANGUAGE_KEY = "app_language";

const i18n = new I18n({
  en,
  kis,
});

i18n.enableFallback = true;

/**
 * Load translations dynamically for a language
 * If translation file doesn't exist, generate it automatically
 */
export const loadLanguageTranslations = async (lang) => {
  // If translations already loaded, skip
  if (i18n.translations[lang] && lang !== "en") {
    return;
  }

  // For English and Kiswahili, use existing JSON files
  if (lang === "en" || lang === "kis") {
    return;
  }

  try {
    // Try to dynamically import the language file first
    try {
      const translations = await import(`./locales/${lang}.json`);
      i18n.translations[lang] = translations.default;
      return;
    } catch (importError) {
      // File doesn't exist, generate translations
      console.log(
        `No translation file for ${lang}, generating automatically...`
      );
    }

    // Generate translations from English base
    const translations = await getTranslations(lang, en);
    i18n.translations[lang] = translations;

    console.log(`Translations loaded for ${lang}`);
  } catch (error) {
    console.error(`Error loading translations for ${lang}:`, error);
    // Fallback to English
    i18n.translations[lang] = en;
  }
};

/**
 * Initializes the app's language from localStorage or the browser's default.
 */
export const initializeLanguage = () => {
  try {
    const storedLanguage = localStorage.getItem(LANGUAGE_KEY);
    // Use the browser's language if no language is stored
    const browserLanguage = navigator.language.split("-")[0];
    i18n.locale = storedLanguage || browserLanguage || "en";
    console.log(`Language initialized to: ${i18n.locale}`);
  } catch (error) {
    console.error("Error initializing language:", error);
    i18n.locale = "en"; // Default to English in case of an error
  }
};

/**
 * Changes the app's language and saves the preference to localStorage.
 * @param {string} lang - The language code to change to.
 */
export const changeLanguage = async (lang) => {
  try {
    // Load translations for the language if not already loaded
    await loadLanguageTranslations(lang);

    localStorage.setItem(LANGUAGE_KEY, lang); // Save language to localStorage
    i18n.locale = lang; // Update the locale in i18n
    console.log(`Language changed to: ${lang}`);
  } catch (error) {
    console.error("Error changing language:", error);
  }
};

export default i18n;
