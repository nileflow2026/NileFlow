/**
 * SEOPanel.jsx
 * Real-time SEO intelligence panel for the product add/edit modal.
 *
 * Usage:
 *   <SEOPanel formData={formData} onApplyAutoFill={handleApplyAutoFill} />
 *
 * onApplyAutoFill receives: { seoTitle, seoDescription, slug, keywords }
 */
import React, { useMemo, useState } from "react";
import {
  analyzeProductSEO,
  generateMetaTitle,
  generateMetaDescription,
  generateSlug,
} from "../utils/seoService";

// ─── Score ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score, grade }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80
      ? "#22c55e"
      : score >= 60
        ? "#f59e0b"
        : score >= 40
          ? "#f97316"
          : "#ef4444";

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="88" height="88" viewBox="0 0 88 88">
        {/* Background ring */}
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="#fde68a"
          strokeWidth="8"
        />
        {/* Progress ring */}
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 44 44)"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
        {/* Score text */}
        <text
          x="44"
          y="40"
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fill={color}
        >
          {score}
        </text>
        <text x="44" y="55" textAnchor="middle" fontSize="10" fill="#92400e">
          /100
        </text>
      </svg>
      <span
        className="text-lg font-bold mt-1"
        style={{ color }}
        aria-label={`SEO grade ${grade}`}
      >
        Grade: {grade}
      </span>
    </div>
  );
}

// ─── Tag chip ──────────────────────────────────────────────────────────────────

function Tag({ label, variant = "neutral" }) {
  const classes = {
    neutral: "bg-amber-100 text-amber-800 border border-amber-200",
    good: "bg-green-100 text-green-800 border border-green-200",
    warn: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    bad: "bg-red-100 text-red-800 border border-red-200",
  };
  return (
    <span
      className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${classes[variant]}`}
    >
      {label}
    </span>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function SEOPanel({ formData, onApplyAutoFill }) {
  const [expanded, setExpanded] = useState(true);
  const [applyClicked, setApplyClicked] = useState(false);

  // Memoised analysis — only recomputes when relevant fields change
  const analysis = useMemo(
    () =>
      analyzeProductSEO({
        name: formData.name || "",
        shortDescription: formData.shortDescription || "",
        description: formData.description || "",
        brand: formData.brand || "",
        tags: formData.tags || "",
        category: formData.categoryId || formData.category || "",
        seoTitle: formData.seoTitle || "",
        seoDescription: formData.seoDescription || "",
        image: formData.image || "",
        images: formData.images || [],
      }),
    [
      formData.name,
      formData.shortDescription,
      formData.description,
      formData.brand,
      formData.tags,
      formData.categoryId,
      formData.category,
      formData.seoTitle,
      formData.seoDescription,
      formData.image,
      formData.images,
    ]
  );

  const handleApply = () => {
    if (onApplyAutoFill) {
      onApplyAutoFill({
        seoTitle:
          formData.seoTitle?.trim() ||
          generateMetaTitle({
            name: formData.name,
            brand: formData.brand,
            category: formData.categoryId || formData.category,
          }),
        seoDescription:
          formData.seoDescription?.trim() ||
          generateMetaDescription({
            name: formData.name,
            shortDescription: formData.shortDescription,
            description: formData.description,
            brand: formData.brand,
          }),
        slug: generateSlug(formData.name),
        keywords: analysis.autoFills.keywords,
      });
    }
    setApplyClicked(true);
    setTimeout(() => setApplyClicked(false), 2000);
  };

  const scoreColor =
    analysis.score >= 80
      ? "text-green-700"
      : analysis.score >= 60
        ? "text-amber-700"
        : analysis.score >= 40
          ? "text-orange-700"
          : "text-red-700";

  return (
    <div className="border border-amber-200 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 shadow-md">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🔍</span>
          <span className="font-bold text-base">SEO Intelligence Panel</span>
          {/* Inline micro-score badge */}
          <span
            className={`text-sm font-semibold px-2 py-0.5 rounded-full bg-white/20 ${scoreColor.replace("text-", "text-white")}`}
          >
            Score: {analysis.score}/100 · {analysis.grade}
          </span>
        </div>
        <span className="text-lg">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="p-5 space-y-5">
          {/* Score ring + auto-fill button */}
          <div className="flex items-start gap-6">
            <ScoreRing score={analysis.score} grade={analysis.grade} />

            <div className="flex-1 space-y-3">
              {/* Slug preview */}
              {formData.name && (
                <div>
                  <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide mb-1">
                    URL Slug Preview
                  </p>
                  <code className="text-xs bg-white/80 border border-amber-200 rounded-lg px-3 py-1.5 text-amber-900 break-all block">
                    /products/{analysis.autoFills.slug || "your-product-name"}
                  </code>
                </div>
              )}

              {/* Auto-fill button */}
              <button
                type="button"
                onClick={handleApply}
                className={`w-full py-2 px-4 rounded-xl text-sm font-semibold transition-all ${
                  applyClicked
                    ? "bg-green-500 text-white"
                    : "bg-white border border-amber-300 text-amber-800 hover:bg-amber-100"
                }`}
              >
                {applyClicked ? "✓ Applied!" : "⚡ Auto-Fill SEO Fields"}
              </button>
              <p className="text-xs text-amber-500 text-center">
                Fills SEO Title, Meta Description & Slug
              </p>
            </div>
          </div>

          {/* Issues */}
          {analysis.issues.length > 0 && (
            <div>
              <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                <span>⚠</span> Issues to fix ({analysis.issues.length})
              </p>
              <ul className="space-y-1.5">
                {analysis.issues.map((issue, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                  >
                    <span className="mt-0.5 shrink-0">✕</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {analysis.suggestions.length > 0 && (
            <div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                <span>💡</span> Suggestions ({analysis.suggestions.length})
              </p>
              <ul className="space-y-1.5">
                {analysis.suggestions.map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
                  >
                    <span className="mt-0.5 shrink-0">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Positives */}
          {analysis.positives.length > 0 && (
            <div>
              <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                <span>✓</span> Looking good ({analysis.positives.length})
              </p>
              <ul className="space-y-1">
                {analysis.positives.map((pos, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-green-800 bg-green-50 border border-green-200 rounded-lg px-3 py-2"
                  >
                    <span className="mt-0.5 shrink-0">✓</span>
                    {pos}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Keyword cloud */}
          {analysis.autoFills.keywords.length > 0 && (
            <div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">
                🏷 Top Keywords Detected
              </p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.autoFills.keywords.map((kw) => (
                  <Tag
                    key={kw}
                    label={kw}
                    variant={
                      analysis.missingKeywords.includes(kw) ? "warn" : "neutral"
                    }
                  />
                ))}
              </div>
              {analysis.missingKeywords.length > 0 && (
                <p className="text-xs text-amber-500 mt-1">
                  Yellow keywords are missing from your SEO fields.
                </p>
              )}
            </div>
          )}

          {/* Duplicate phrases */}
          {analysis.duplicatePhrases.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2">
              <p className="text-xs font-bold text-yellow-700 mb-1">
                ⚠ Repeated phrasing detected
              </p>
              <div className="flex flex-wrap gap-1">
                {analysis.duplicatePhrases.slice(0, 4).map((phrase, i) => (
                  <Tag key={i} label={`"${phrase}"`} variant="warn" />
                ))}
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-amber-600 mb-1">
              <span>SEO score</span>
              <span className={`font-bold ${scoreColor}`}>
                {analysis.score}/100
              </span>
            </div>
            <div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${analysis.score}%`,
                  backgroundColor:
                    analysis.score >= 80
                      ? "#22c55e"
                      : analysis.score >= 60
                        ? "#f59e0b"
                        : analysis.score >= 40
                          ? "#f97316"
                          : "#ef4444",
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-amber-400 mt-1">
              <span>Weak</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
