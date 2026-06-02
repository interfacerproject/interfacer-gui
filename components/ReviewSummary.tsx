/**
 * ReviewSummary – Star rating average + distribution bar chart.
 *
 * Matches the Figma mockup "Reviews for this design" summary section
 * showing the average rating, total count, and per-star distribution bars.
 */

import type { ReviewSummary as ReviewSummaryType } from "lib/feedback";
import { useTranslation } from "next-i18next";

// ---------------------------------------------------------------------------
// Star icon (filled)
// ---------------------------------------------------------------------------
function StarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="#f1bd4d">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.284-3.957z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Skeleton placeholder
// ---------------------------------------------------------------------------
function SkeletonBlock({ width, height }: { width: string; height: string }) {
  return (
    <div
      className="animate-pulse rounded"
      style={{
        width,
        height,
        backgroundColor: "var(--ifr-skeleton-bg)",
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface ReviewSummaryProps {
  summary?: ReviewSummaryType | null;
  loading?: boolean;
  error?: string | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ReviewSummary({ summary, loading, error }: ReviewSummaryProps) {
  const { t } = useTranslation("common");

  // --- Loading ---
  if (loading) {
    return (
      <div className="flex items-start gap-6 p-5 border border-[#c9cccf] rounded-lg">
        <div className="flex flex-col items-center gap-1">
          <SkeletonBlock width="48px" height="28px" />
          <SkeletonBlock width="64px" height="12px" />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-2">
              <SkeletonBlock width="28px" height="12px" />
              <SkeletonBlock width={`${100 - i * 15}%`} height="8px" />
              <SkeletonBlock width="16px" height="12px" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Error ---
  if (error) {
    return (
      <div className="p-4 border border-[#c5281d] rounded-lg" style={{ backgroundColor: "var(--ifr-red-hover-bg)" }}>
        <p className="m-0 text-[#c5281d]" style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}>
          {error}
        </p>
      </div>
    );
  }

  // --- Empty ---
  if (!summary || summary.total_reviews === 0) {
    return (
      <div
        className="p-5 border border-[#c9cccf] rounded-lg text-center"
        style={{ fontFamily: "var(--ifr-font-body)" }}
      >
        <p className="m-0 text-ifr-text-secondary" style={{ fontSize: "var(--ifr-fs-base)" }}>
          {t("No reviews yet")}
        </p>
      </div>
    );
  }

  // --- Data ---
  const { average_rating, total_reviews, rating_distribution } = summary;
  const maxCount = Math.max(...Object.values(rating_distribution), 1);

  return (
    <div className="flex items-start gap-6 p-5 border border-[#c9cccf] rounded-lg">
      {/* Left: Big average */}
      <div className="flex flex-col items-center shrink-0" style={{ minWidth: "64px" }}>
        <span
          className="flex items-baseline gap-0.5"
          style={{
            fontFamily: "var(--ifr-font-heading)",
            fontSize: "var(--ifr-fs-2xl)",
            fontWeight: "var(--ifr-fw-bold)",
            color: "var(--ifr-text-primary)",
            lineHeight: 1,
          }}
        >
          {average_rating.toFixed(1)}
        </span>
        <div className="flex items-center gap-0.5 mt-1">
          {[1, 2, 3, 4, 5].map(i => (
            <StarIcon key={i} size={12} />
          ))}
        </div>
        <span
          className="mt-1"
          style={{
            fontFamily: "var(--ifr-font-body)",
            fontSize: "var(--ifr-fs-sm)",
            color: "var(--ifr-text-secondary)",
          }}
        >
          {total_reviews} {total_reviews === 1 ? t("review") : t("reviews")}
        </span>
      </div>

      {/* Right: Distribution bars */}
      <div className="flex-1 flex flex-col gap-1.5">
        {[5, 4, 3, 2, 1].map(stars => {
          const count = rating_distribution[stars] || 0;
          const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
          return (
            <div key={stars} className="flex items-center gap-2">
              <span
                className="shrink-0 text-right"
                style={{
                  width: "24px",
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-xs)",
                  color: "var(--ifr-text-secondary)",
                }}
              >
                {stars}★
              </span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(200,212,229,0.3)" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: count > 0 ? "#f1bd4d" : "transparent",
                  }}
                />
              </div>
              <span
                className="shrink-0"
                style={{
                  width: "20px",
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-xs)",
                  color: "var(--ifr-text-secondary)",
                  textAlign: "right",
                }}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
