/**
 * CommentForm – Inline reply/comment input.
 *
 * Displays below a comment or at the end of a thread.
 * Simple text input with Post button.
 */

import { useAuth } from "hooks/useAuth";
import useFeedbackApi from "lib/feedback";
import { useTranslation } from "next-i18next";
import { useState } from "react";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface CommentFormProps {
  projectUlid: string;
  parentId?: string; // Reply to a specific comment
  onSuccess: () => void;
  onCancel: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function CommentForm({ projectUlid, parentId, onSuccess, onCancel }: CommentFormProps) {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const api = useFeedbackApi();

  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = content.trim().length > 0 && !submitting;

  // Auth gate
  if (!user) {
    return (
      <div className="p-4 border border-[#c9cccf] rounded-lg text-center">
        <p
          className="m-0 text-ifr-text-secondary"
          style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
        >
          {t("Login required")}
        </p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      await api.createComment(projectUlid, content.trim(), parentId);
      setContent("");
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={t("Write a reply...")}
          rows={2}
          className="flex-1 border border-[#c9cccf] rounded-md p-2.5 resize-none outline-none focus:border-[#036a53] transition-colors"
          style={{
            fontFamily: "var(--ifr-font-body)",
            fontSize: "var(--ifr-fs-sm)",
            color: "var(--ifr-text-primary)",
            backgroundColor: "var(--ifr-bg-input)",
          }}
          onKeyDown={e => {
            if (e.key === "Enter" && e.metaKey && canSubmit) {
              handleSubmit();
            }
          }}
        />
        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 py-2 rounded-md border-none cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#f1bd4d",
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-sm)",
              fontWeight: "var(--ifr-fw-semibold)",
              color: "#1a1a1a",
            }}
          >
            {submitting ? "..." : t("Post")}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-transparent border border-[#c9cccf] rounded-md cursor-pointer hover:bg-[#f5f5f5] transition-colors"
            style={{
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-sm)",
              color: "var(--ifr-text-secondary)",
            }}
          >
            {t("Cancel")}
          </button>
        </div>
      </div>
      {error && (
        <p className="m-0 text-[#c5281d]" style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-xs)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
