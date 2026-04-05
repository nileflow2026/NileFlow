/**
 * imageOptimizer.js
 * Image SEO & compression utilities for the Nile Flow Vendor Dashboard.
 *
 * Features:
 *  - Compress images before upload (canvas-based, no external deps)
 *  - Convert WebP → PNG/JPEG
 *  - Generate SEO-optimised alt text
 *  - Generate SEO-optimised filenames
 */

import { generateAltText, generateImageFilename } from "./seoService";

// ─── Config ───────────────────────────────────────────────────────────────────

const DEFAULT_MAX_WIDTH = 1920;
const DEFAULT_MAX_HEIGHT = 1920;
const DEFAULT_QUALITY = 0.82; // 82 % — good balance of quality vs file size
const THUMBNAIL_MAX = 400;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Load a File into an HTMLImageElement.
 * @param {File} file
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Calculate new dimensions that fit within maxW × maxH while preserving ratio.
 */
function fitDimensions(srcW, srcH, maxW, maxH) {
  if (srcW <= maxW && srcH <= maxH) return { w: srcW, h: srcH };
  const ratio = Math.min(maxW / srcW, maxH / srcH);
  return { w: Math.round(srcW * ratio), h: Math.round(srcH * ratio) };
}

// ─── Core compression ─────────────────────────────────────────────────────────

/**
 * Compress and optionally resize an image File.
 *
 * @param {File} file           - Original file
 * @param {object} [opts]
 * @param {number} [opts.maxWidth=1920]
 * @param {number} [opts.maxHeight=1920]
 * @param {number} [opts.quality=0.82]   - 0–1 (JPEG/WebP only)
 * @param {string} [opts.outputFormat]   - e.g. "image/jpeg", defaults to file type
 * @returns {Promise<File>}     - Compressed file with same or reduced size
 */
export async function compressImage(file, opts = {}) {
  const {
    maxWidth = DEFAULT_MAX_WIDTH,
    maxHeight = DEFAULT_MAX_HEIGHT,
    quality = DEFAULT_QUALITY,
    outputFormat,
  } = opts;

  // Skip SVG — no compression needed
  if (file.type === "image/svg+xml") return file;

  const format = outputFormat || (file.type === "image/png" ? "image/png" : "image/jpeg");

  const img = await loadImage(file);
  const { w, h } = fitDimensions(img.naturalWidth, img.naturalHeight, maxWidth, maxHeight);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Image compression failed"));
        const ext = format === "image/png" ? ".png" : ".jpg";
        const originalName = file.name.replace(/\.[^.]+$/, ext);
        resolve(new File([blob], originalName, { type: format }));
      },
      format,
      format === "image/png" ? undefined : quality,
    );
  });
}

/**
 * Compress + rename a product image with an SEO-optimised filename.
 *
 * @param {File} file
 * @param {string} productName   - Used to generate slug-based filename
 * @param {number} [index=0]     - 0 = primary image, 1+ = additional images
 * @param {object} [opts]        - Same as compressImage opts
 * @returns {Promise<File>}
 */
export async function optimizeProductImage(file, productName, index = 0, opts = {}) {
  const compressed = await compressImage(file, opts);
  const seoFilename = generateImageFilename(productName, index);
  return new File([compressed], seoFilename, { type: compressed.type });
}

/**
 * Generate alt text for a product image.
 * Thin wrapper so callers don't need to import seoService directly.
 *
 * @param {string} productName
 * @param {string} [brand]
 * @returns {string}
 */
export function getImageAltText(productName, brand = "") {
  return generateAltText({ name: productName, brand });
}

/**
 * Get human-readable file size string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Quick check whether an image needs compression (> threshold).
 * @param {File} file
 * @param {number} [thresholdMB=1]
 * @returns {boolean}
 */
export function needsCompression(file, thresholdMB = 1) {
  return file.size > thresholdMB * 1024 * 1024;
}
