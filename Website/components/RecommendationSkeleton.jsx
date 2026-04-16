// components/RecommendationSkeleton.jsx
import React from "react";

const RecommendationSkeleton = () => {
  return (
    <section className="recommendation-section">
      <div className="flex justify-between items-center mb-6">
        {/* Title skeleton */}
        <div className="h-8 bg-[var(--nf-bg-subtle)] rounded-lg w-64 animate-pulse"></div>

        {/* Cultural badge skeleton */}
        <div className="h-6 bg-[var(--nf-bg-subtle)] rounded-full w-40 animate-pulse"></div>
      </div>

      {/* Recommendation cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="bg-[var(--nf-card-bg)] backdrop-blur-sm border border-[var(--nf-border-subtle)] rounded-2xl p-4 animate-pulse"
          >
            {/* Image skeleton */}
            <div className="aspect-square bg-[var(--nf-bg-subtle)] rounded-xl mb-4"></div>

            {/* Title skeleton */}
            <div className="h-4 bg-[var(--nf-bg-subtle)] rounded mb-2"></div>
            <div className="h-4 bg-[var(--nf-bg-subtle)] rounded w-3/4 mb-3"></div>

            {/* Price skeleton */}
            <div className="h-5 bg-[var(--nf-bg-subtle)] rounded w-1/2 mb-3"></div>

            {/* Rating skeleton */}
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-4 h-4 bg-[var(--nf-bg-subtle)] rounded"></div>
              ))}
            </div>

            {/* Action button skeleton */}
            <div className="h-8 bg-[var(--nf-bg-subtle)] rounded-lg w-full"></div>
          </div>
        ))}
      </div>

      {/* Debug panel skeleton */}
      <div className="mt-8 bg-[var(--nf-card-bg)] border border-[var(--nf-border-subtle)] rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-[var(--nf-bg-subtle)] rounded w-32 mb-2"></div>
        <div className="space-y-2">
          <div className="h-3 bg-[var(--nf-bg-subtle)] rounded w-full"></div>
          <div className="h-3 bg-[var(--nf-bg-subtle)] rounded w-3/4"></div>
          <div className="h-3 bg-[var(--nf-bg-subtle)] rounded w-1/2"></div>
        </div>
      </div>
    </section>
  );
};

export default RecommendationSkeleton;
