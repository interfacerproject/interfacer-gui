/**
 * ReviewSection – Full reviews block for project detail pages.
 *
 * Fetches reviews and summary from the feedback service, renders:
 * - Section header with count badge
 * - ReviewSummary (star avg + distribution)
 * - Sort dropdown (newest / oldest)
 * - ReviewCard list (first N visible, expandable)
 * - "Post a review" trigger
 */

import { ChevronDownIcon, PencilAltIcon } from "@heroicons/react/outline";
import CommentForm from "components/CommentForm";
import CommentThread from "components/CommentThread";
import ReviewCard from "components/ReviewCard";
import ReviewSummary from "components/ReviewSummary";
import { useAuth } from "hooks/useAuth";
import useFeedbackApi, { type Review } from "lib/feedback";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Skeleton cards for loading state
// ---------------------------------------------------------------------------
function SkeletonCard() {
  return (
    <div
      className="border border-[#c9cccf] rounded-lg overflow-hidden animate-pulse"
      style={{ backgroundColor: "var(--ifr-bg-surface)" }}
    >
      <div className="flex items-start gap-3 p-4">
        <div
          className="rounded-full shrink-0"
          style={{ width: 40, height: 40, backgroundColor: "var(--ifr-skeleton-bg)" }}
        />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-4 rounded w-32" style={{ backgroundColor: "var(--ifr-skeleton-bg)" }} />
          <div className="h-3 rounded w-24" style={{ backgroundColor: "var(--ifr-skeleton-bg)" }} />
        </div>
      </div>
      <div className="px-4 pb-4 flex flex-col gap-2">
        <div className="h-3 rounded w-full" style={{ backgroundColor: "var(--ifr-skeleton-bg)" }} />
        <div className="h-3 rounded w-3/4" style={{ backgroundColor: "var(--ifr-skeleton-bg)" }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface ReviewSectionProps {
  projectUlid: string;
  projectName?: string;
  /** Called when user clicks "Post a review" – parent opens the form */
  onPostReview?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ReviewSection({ projectUlid, projectName, onPostReview }: ReviewSectionProps) {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const api = useFeedbackApi();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any | null>(null);
  const [sortNewest, setSortNewest] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyKey, setReplyKey] = useState(0); // increment to refresh thread

  const INITIAL_VISIBLE = 3;

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [reviewsRes, summaryRes] = await Promise.all([
        api.getReviews(projectUlid),
        api.getReviewSummary(projectUlid),
      ]);
      setReviews(reviewsRes?.reviews || []);
      setSummary(summaryRes || null);
    } catch (err: any) {
      setError(err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [api, projectUlid]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sort reviews
  const sortedReviews = [...(reviews || [])].sort((a, b) => {
    const da = new Date(a.created_at).getTime();
    const db = new Date(b.created_at).getTime();
    return sortNewest ? db - da : da - db;
  });

  const visibleReviews = expanded ? sortedReviews : sortedReviews.slice(0, INITIAL_VISIBLE);
  const hasMore = sortedReviews.length > INITIAL_VISIBLE;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3
            className="m-0 text-ifr-text-primary"
            style={{
              fontFamily: "var(--ifr-font-heading)",
              fontSize: "var(--ifr-fs-lg)",
              fontWeight: "var(--ifr-fw-bold)",
            }}
          >
            {t("Reviews for this design")}
          </h3>
          {!loading && summary && summary.total_reviews > 0 && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "rgba(200,212,229,0.25)",
                fontFamily: "var(--ifr-font-body)",
                fontSize: "var(--ifr-fs-xs)",
                fontWeight: "var(--ifr-fw-medium)",
                color: "var(--ifr-text-secondary)",
              }}
            >
              {summary.total_reviews}
            </span>
          )}
        </div>

        {/* Sort + Post buttons */}
        <div className="flex items-center gap-2">
          {/* Sort dropdown */}
          {reviews.length > 1 && (
            <div className="relative">
              <select
                value={sortNewest ? "newest" : "oldest"}
                onChange={e => setSortNewest(e.target.value === "newest")}
                className="appearance-none bg-transparent border border-[#c9cccf] rounded-md pl-3 pr-8 py-1.5 cursor-pointer"
                style={{
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-sm)",
                  color: "var(--ifr-text-primary)",
                }}
              >
                <option value="newest">{t("Newest first")}</option>
                <option value="oldest">{t("Oldest first")}</option>
              </select>
              <ChevronDownIcon
                className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                style={{ color: "var(--ifr-text-secondary)" }}
              />
            </div>
          )}

          {/* Post review */}
          {onPostReview && (
            <button
              type="button"
              onClick={onPostReview}
              disabled={!user}
              title={!user ? t("Login required") : undefined}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md border-none cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "#f1bd4d",
                fontFamily: "var(--ifr-font-body)",
                fontSize: "var(--ifr-fs-sm)",
                fontWeight: "var(--ifr-fw-semibold)",
                color: "#1a1a1a",
              }}
            >
              <PencilAltIcon className="w-4 h-4" />
              {t("Post a review")}
            </button>
          )}
        </div>
      </div>

      {/* Subtitle */}
      <p
        className="m-0 text-ifr-text-secondary"
        style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
      >
        {t("Community feedback and ratings for this project")}
      </p>

      {/* Summary */}
      <ReviewSummary summary={summary} loading={loading} error={error} />

      {/* Error (non-summary) */}
      {error && !loading && (
        <div className="p-4 border border-[#c5281d] rounded-lg" style={{ backgroundColor: "var(--ifr-red-hover-bg)" }}>
          <p
            className="m-0 text-[#c5281d]"
            style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
          >
            {error}
          </p>
          <button
            type="button"
            onClick={fetchData}
            className="mt-2 px-3 py-1 rounded border-none cursor-pointer"
            style={{
              backgroundColor: "var(--ifr-text-primary)",
              color: "#fff",
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-xs)",
            }}
          >
            {t("Retry")}
          </button>
        </div>
      )}

      {/* Review list */}
      {loading && reviews.length === 0 ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          {visibleReviews.length > 0 ? (
            <div className="flex flex-col gap-3">
              {visibleReviews.map(review => {
                const isReplying = activeReplyId === review.id;
                return (
                  <div key={review.id} className="flex flex-col gap-3">
                    <ReviewCard review={review} onReply={() => setActiveReplyId(isReplying ? null : review.id)} />

                    {/* Always show existing replies, only show form on Reply click */}
                    <div className="ml-11 flex flex-col gap-3">
                      <CommentThread key={`thread-${replyKey}`} projectUlid={projectUlid} parentId={review.id} />
                      {isReplying && (
                        <CommentForm
                          projectUlid={projectUlid}
                          parentId={review.id}
                          onSuccess={() => {
                            setActiveReplyId(null);
                            setReplyKey(k => k + 1);
                          }}
                          onCancel={() => setActiveReplyId(null)}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : !loading ? (
            /* Empty state when no reviews exist */
            <div className="text-center py-8">
              <p
                className="m-0 text-ifr-text-secondary"
                style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)" }}
              >
                {t("No reviews yet. Be the first to review!")}
              </p>
            </div>
          ) : null}
        </>
      )}

      {/* See all / collapse */}
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="self-start inline-flex items-center gap-1 bg-transparent border-none cursor-pointer hover:underline"
          style={{
            fontFamily: "var(--ifr-font-body)",
            fontSize: "var(--ifr-fs-sm)",
            color: "var(--ifr-green)",
            fontWeight: "var(--ifr-fw-semibold)",
          }}
        >
          {expanded ? t("Show less") : `${t("See all reviews")} (${sortedReviews.length})`}
        </button>
      )}
    </div>
  );
}
