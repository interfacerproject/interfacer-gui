/**
 * ReviewForm – "Post a review" inline form matching the Figma mockup.
 *
 * Features:
 * - Project name + ID label (e.g. "Fabulaser Mini · IFR-0042")
 * - Review title input
 * - Star rating selector (1-5 clickable stars with hover/fill)
 * - Content textarea
 * - Attach Picture button (placeholder – deferred to v2)
 * - Post button + cancel
 * - Auth gating: shows login prompt if not authenticated
 * - Success toast after posting
 */

import { PaperClipIcon, StarIcon as StarIconOutline } from "@heroicons/react/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/solid";
import { useAuth } from "hooks/useAuth";
import useFeedbackApi from "lib/feedback";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useState } from "react";

// ---------------------------------------------------------------------------
// Inline star rating input
// ---------------------------------------------------------------------------
function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map(i => {
        const filled = i <= (hover || value);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            onMouseEnter={() => setHover(i)}
            className="bg-transparent border-none p-0 cursor-pointer transition-transform hover:scale-110"
          >
            {filled ? (
              <StarIconSolid className="w-7 h-7" style={{ color: "#f1bd4d" }} />
            ) : (
              <StarIconOutline className="w-7 h-7" style={{ color: "#c9cccf" }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface ReviewFormProps {
  projectUlid: string;
  projectName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ReviewForm({ projectUlid, projectName, onSuccess, onCancel }: ReviewFormProps) {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const api = useFeedbackApi();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const canSubmit = rating >= 1 && rating <= 5 && content.trim().length >= 10 && !submitting;

  // Auth gate
  if (!user) {
    return (
      <div className="p-6 border border-[#c9cccf] rounded-lg text-center">
        <p
          className="m-0 mb-3 text-ifr-text-secondary"
          style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)" }}
        >
          {t("Login required")}
        </p>
        <Link href="/sign_in">
          <a
            className="inline-flex items-center px-4 py-2 rounded-md no-underline"
            style={{
              backgroundColor: "var(--ifr-green)",
              color: "#fff",
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-sm)",
              fontWeight: "var(--ifr-fw-semibold)",
            }}
          >
            {t("Login")}
          </a>
        </Link>
      </div>
    );
  }

  // Success state
  if (showSuccess) {
    return (
      <div
        className="p-6 border border-[#036a53] rounded-lg text-center"
        style={{ backgroundColor: "var(--ifr-green-bg)" }}
      >
        <p
          className="m-0"
          style={{
            fontFamily: "var(--ifr-font-body)",
            fontSize: "var(--ifr-fs-md)",
            fontWeight: "var(--ifr-fw-semibold)",
            color: "var(--ifr-green)",
          }}
        >
          {t("Review published")}
        </p>
        <p
          className="m-0 mt-1 text-ifr-text-secondary"
          style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
        >
          {t("Review visible")}
        </p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      const combinedContent = title.trim() ? `${title.trim()}\n\n${content.trim()}` : content.trim();
      await api.createReview(projectUlid, rating, combinedContent);
      setShowSuccess(true);
      setTimeout(() => onSuccess(), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="border border-[#c9cccf] rounded-lg overflow-hidden"
      style={{ backgroundColor: "var(--ifr-bg-surface)" }}
    >
      {/* Project label */}
      <div className="px-6 pt-5 pb-2">
        <span
          className="text-ifr-text-secondary"
          style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
        >
          {projectName}
        </span>
      </div>

      {/* Review title */}
      <div className="px-6 pb-3">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t("Review title")}
          className="w-full border border-[#c9cccf] rounded-md p-2.5 outline-none focus:border-[#036a53] transition-colors"
          style={{
            fontFamily: "var(--ifr-font-body)",
            fontSize: "var(--ifr-fs-base)",
            fontWeight: "var(--ifr-fw-semibold)",
            color: "var(--ifr-text-primary)",
            backgroundColor: "var(--ifr-bg-input)",
          }}
        />
      </div>

      {/* Star rating */}
      <div className="px-6 pb-3">
        <p
          className="m-0 mb-2 text-ifr-text-primary"
          style={{
            fontFamily: "var(--ifr-font-body)",
            fontSize: "var(--ifr-fs-sm)",
            fontWeight: "var(--ifr-fw-medium)",
          }}
        >
          {t("Rate this design")}
        </p>
        <StarInput value={rating} onChange={setRating} />
      </div>

      {/* Content textarea */}
      <div className="px-6 pb-3">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={t("Write your review...")}
          rows={4}
          className="w-full border border-[#c9cccf] rounded-md p-3 resize-y outline-none focus:border-[#036a53] transition-colors"
          style={{
            fontFamily: "var(--ifr-font-body)",
            fontSize: "var(--ifr-fs-base)",
            color: "var(--ifr-text-primary)",
            backgroundColor: "var(--ifr-bg-input)",
          }}
        />
        {content.length > 0 && content.length < 10 && (
          <p
            className="m-0 mt-1 text-[#c5281d]"
            style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-xs)" }}
          >
            {t("Minimum 10 characters")}
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 pb-3">
          <p
            className="m-0 text-[#c5281d]"
            style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
          >
            {error}
          </p>
        </div>
      )}

      {/* Actions: Attach + Post + Cancel */}
      <div
        className="flex items-center justify-between px-6 py-3 border-t border-[#f0f0f0]"
        style={{ backgroundColor: "rgba(200,212,229,0.05)" }}
      >
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1.5 bg-transparent border-none cursor-not-allowed opacity-40"
          style={{
            fontFamily: "var(--ifr-font-body)",
            fontSize: "var(--ifr-fs-sm)",
            color: "var(--ifr-text-secondary)",
          }}
        >
          <PaperClipIcon className="w-4 h-4" />
          {t("Attach Picture")}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 bg-transparent border border-[#c9cccf] rounded-md cursor-pointer hover:bg-[#f5f5f5] transition-colors disabled:opacity-50"
            style={{
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-sm)",
              color: "var(--ifr-text-secondary)",
            }}
          >
            {t("Cancel")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md border-none cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#f1bd4d",
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-sm)",
              fontWeight: "var(--ifr-fw-semibold)",
              color: "#1a1a1a",
            }}
          >
            {submitting ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
                {t("Posting...")}
              </>
            ) : (
              t("Post")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
