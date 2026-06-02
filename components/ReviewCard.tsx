/**
 * ReviewCard – Single review display with user avatar, stars, content, and actions.
 *
 * Matches the Figma mockup review cards showing avatar, name, @handle,
 * star rating, review title/content, edit date, Reply and helpful buttons.
 */

import { ChatAlt2Icon } from "@heroicons/react/outline";
import BrUserAvatar from "components/brickroom/BrUserAvatar";
import dayjs from "lib/dayjs";
import type { Review } from "lib/feedback";
import { useTranslation } from "next-i18next";

// ---------------------------------------------------------------------------
// Star display (1-5 filled, rest empty)
// ---------------------------------------------------------------------------
function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill={i <= rating ? "#f1bd4d" : "#c9cccf"}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.284-3.957z" />
        </svg>
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Format date using dayjs with relativeTime plugin
// ---------------------------------------------------------------------------
function formatDate(iso: string): string {
  return dayjs(iso).fromNow();
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface ReviewCardProps {
  review: Review;
  /** True when the review was edited (updated_at != created_at) */
  onReply?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ReviewCard({ review, onReply }: ReviewCardProps) {
  const { t } = useTranslation("common");

  const isEdited = review.updated_at !== review.created_at;

  // Parse title from content: first line before \n\n is the title
  const rawContent = review.content || "";
  const separatorIdx = rawContent.indexOf("\n\n");
  const hasTitle = separatorIdx > 0;
  const displayTitle = hasTitle ? rawContent.slice(0, separatorIdx) : "";
  const displayBody = hasTitle ? rawContent.slice(separatorIdx + 2) : rawContent;

  return (
    <div
      className="border border-[#c9cccf] rounded-lg overflow-hidden"
      style={{ backgroundColor: "var(--ifr-bg-surface)" }}
    >
      {/* Header: avatar + name + handle + stars */}
      <div className="flex items-start gap-3 p-4 pb-2">
        <BrUserAvatar userId={review.user_ulid} size="40px" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-ifr-text-primary truncate"
              style={{
                fontFamily: "var(--ifr-font-body)",
                fontSize: "var(--ifr-fs-md)",
                fontWeight: "var(--ifr-fw-semibold)",
              }}
            >
              {review.user_ulid.slice(0, 8)}
            </span>
            <StarRating rating={review.rating} size={14} />
          </div>

          {/* Optional: user handle */}
          <span
            className="block text-ifr-text-secondary mt-0.5"
            style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
          >
            {"@"}
            {review.user_ulid.slice(0, 6)}
          </span>
        </div>
      </div>

      {/* Body: review content */}
      {displayBody && (
        <div className="px-4 pb-3">
          {displayTitle && (
            <p
              className="m-0 mb-1.5 text-ifr-text-primary"
              style={{
                fontFamily: "var(--ifr-font-body)",
                fontSize: "var(--ifr-fs-md)",
                fontWeight: "var(--ifr-fw-semibold)",
                lineHeight: "22px",
              }}
            >
              {displayTitle}
            </p>
          )}
          <p
            className="m-0 text-ifr-text-primary whitespace-pre-line"
            style={{
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-base)",
              lineHeight: "22px",
            }}
          >
            {displayBody}
          </p>
        </div>
      )}

      {/* Footer: edit date + actions */}
      <div
        className="flex items-center justify-between px-4 py-2 border-t border-[#f0f0f0]"
        style={{ backgroundColor: "rgba(200,212,229,0.05)" }}
      >
        <div className="flex items-center gap-4">
          {/* Edit date */}
          {isEdited && (
            <span
              className="text-ifr-text-secondary"
              style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-xs)" }}
            >
              {t("Last edit")}
              {":"} {formatDate(review.updated_at)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Reply button */}
          {onReply && (
            <button
              type="button"
              onClick={onReply}
              className="inline-flex items-center gap-1 bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity text-ifr-text-secondary"
              style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-xs)" }}
            >
              <ChatAlt2Icon className="w-3.5 h-3.5" />
              {t("Reply")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
