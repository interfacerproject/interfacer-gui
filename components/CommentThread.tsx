/**
 * CommentThread – Displays threaded comments/replies with nesting.
 *
 * Comments are fetched from the feedback service and rendered flat with
 * visual indentation based on hierarchy (parent_id linking).
 */

import { TrashIcon } from "@heroicons/react/outline";
import BrUserAvatar from "components/brickroom/BrUserAvatar";
import { useAuth } from "hooks/useAuth";
import useFeedbackApi, { type Comment } from "lib/feedback";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Format relative date
// ---------------------------------------------------------------------------
function formatRelative(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return "Today";
  if (diffDays < 2) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ---------------------------------------------------------------------------
// Single comment row
// ---------------------------------------------------------------------------
function CommentRow({
  comment,
  depth,
  onReply,
  onDelete,
  currentUserUlid,
}: {
  comment: Comment;
  depth: number;
  onReply?: (id: string) => void;
  onDelete?: (id: string) => void;
  currentUserUlid?: string;
}) {
  const { t } = useTranslation("common");
  const isDeleted = comment.status === "deleted";
  const isAuthor = currentUserUlid === comment.user_ulid;
  const maxDepth = Math.min(depth, 2);
  const indentPx = maxDepth * 36;

  return (
    <div className="flex gap-3" style={{ paddingLeft: `${indentPx}px` }}>
      {!isDeleted && <BrUserAvatar userId={comment.user_ulid} size="32px" />}
      {isDeleted && (
        <div
          className="shrink-0 rounded-full flex items-center justify-center"
          style={{ width: 32, height: 32, backgroundColor: "var(--ifr-skeleton-bg)" }}
        >
          <span className="text-ifr-text-secondary" style={{ fontSize: "10px" }}>
            {"—"}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        {isDeleted ? (
          <p
            className="m-0 text-ifr-text-secondary italic"
            style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
          >
            {"["}
            {t("Deleted")}
            {"]"}
          </p>
        ) : (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-ifr-text-primary"
                style={{
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-sm)",
                  fontWeight: "var(--ifr-fw-semibold)",
                }}
              >
                {comment.user_ulid.slice(0, 8)}
              </span>
              <span
                className="text-ifr-text-secondary"
                style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-xs)" }}
              >
                {formatRelative(comment.created_at)}
              </span>
            </div>
            <p
              className="m-0 mt-1 text-ifr-text-primary whitespace-pre-line"
              style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)", lineHeight: "20px" }}
            >
              {comment.content}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              {onReply && (
                <button
                  type="button"
                  onClick={() => onReply(comment.id)}
                  className="bg-transparent border-none cursor-pointer hover:underline p-0"
                  style={{
                    fontFamily: "var(--ifr-font-body)",
                    fontSize: "var(--ifr-fs-xs)",
                    color: "var(--ifr-text-secondary)",
                  }}
                >
                  {t("Reply")}
                </button>
              )}
              {isAuthor && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(comment.id)}
                  className="inline-flex items-center gap-1 bg-transparent border-none cursor-pointer hover:opacity-70 p-0"
                  style={{
                    fontFamily: "var(--ifr-font-body)",
                    fontSize: "var(--ifr-fs-xs)",
                    color: "var(--ifr-red)",
                  }}
                >
                  <TrashIcon className="w-3 h-3" />
                  {t("Delete")}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
function SkeletonRow({ indent }: { indent: number }) {
  return (
    <div className="flex gap-3 animate-pulse" style={{ paddingLeft: `${indent}px` }}>
      <div
        className="rounded-full shrink-0"
        style={{ width: 32, height: 32, backgroundColor: "var(--ifr-skeleton-bg)" }}
      />
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="h-3 rounded w-20" style={{ backgroundColor: "var(--ifr-skeleton-bg)" }} />
          <div className="h-3 rounded w-12" style={{ backgroundColor: "var(--ifr-skeleton-bg)" }} />
        </div>
        <div className="h-3 rounded w-full" style={{ backgroundColor: "var(--ifr-skeleton-bg)" }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confirm dialog
// ---------------------------------------------------------------------------
function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation("common");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
      <div className="rounded-lg p-6 max-w-sm mx-4" style={{ backgroundColor: "var(--ifr-bg-surface)" }}>
        <p
          className="m-0 mb-4 text-ifr-text-primary"
          style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)" }}
        >
          {message}
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-transparent border border-[#c9cccf] rounded-md cursor-pointer"
            style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
          >
            {t("Cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-md border-none cursor-pointer text-white"
            style={{
              backgroundColor: "var(--ifr-red)",
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-sm)",
            }}
          >
            {t("Delete")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface CommentThreadProps {
  projectUlid: string;
  parentId?: string; // If provided, show replies to a specific parent
  onReply?: (commentId: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function CommentThread({ projectUlid, parentId, onReply }: CommentThreadProps) {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const api = useFeedbackApi();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getComments(projectUlid, parentId ? { parent_id: parentId } : undefined);
      setComments(res?.comments || []);
    } catch (err: any) {
      setError(err.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [api, projectUlid, parentId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Delete handler
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteComment(deleteTarget);
      setDeleteTarget(null);
      fetchComments();
    } catch (err: any) {
      setError(err.message || "Failed to delete comment");
      setDeleteTarget(null);
    }
  };

  // Group: build tree from flat list
  // For simplicity, we show flat with visual indentation based on parent_id
  // This works for the 2-level depth supported by the mockup

  return (
    <div className="flex flex-col gap-3">
      {/* Loading */}
      {loading && (
        <>
          <SkeletonRow indent={0} />
          <SkeletonRow indent={36} />
          <SkeletonRow indent={0} />
        </>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="p-3 border border-[#c5281d] rounded-lg" style={{ backgroundColor: "var(--ifr-red-hover-bg)" }}>
          <p
            className="m-0 text-[#c5281d]"
            style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
          >
            {error}
          </p>
          <button
            type="button"
            onClick={fetchComments}
            className="mt-2 px-3 py-1 rounded border-none cursor-pointer text-white"
            style={{
              backgroundColor: "var(--ifr-text-primary)",
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-xs)",
            }}
          >
            {t("Retry")}
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && comments.length === 0 && (
        <p
          className="m-0 text-ifr-text-secondary text-center py-4"
          style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
        >
          {parentId ? t("No replies yet") : t("No comments yet")}
        </p>
      )}

      {/* Comment list */}
      {!loading &&
        comments.map(comment => (
          <CommentRow
            key={comment.id}
            comment={comment}
            depth={comment.parent_id ? 1 : 0}
            onReply={onReply}
            onDelete={setDeleteTarget}
            currentUserUlid={user?.ulid}
          />
        ))}

      {/* Delete confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          message={t("Are you sure you want to delete this comment?")}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
