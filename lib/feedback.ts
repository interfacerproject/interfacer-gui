/**
 * API client for the interfacer-feedback-service REST backend.
 * Provides a React hook `useFeedbackApi` with typed methods for reviews and comments.
 *
 * Auth: Signs requests with EdDSA keys via did-sign/did-pk headers
 * (same pattern as useDppApi / lib/dpp.ts).
 *
 * @see ~/dyne/interfacer-feedback-service/cmd/main/main.go for route definitions
 */

// @ts-ignore
import { useAuth } from "hooks/useAuth";
import { useCallback, useMemo } from "react";
// @ts-ignore
import sign from "zenflows-crypto/src/sign_graphql.zen";

const FEEDBACK_BASE_URL = process.env.NEXT_PUBLIC_FEEDBACK_URL;

// ---------------------------------------------------------------------------
// Types (mirrors interfacer-feedback-service/internal/model/model.go)
// ---------------------------------------------------------------------------

export interface Review {
  id: string;
  project_ulid: string;
  user_ulid: string;
  rating: number; // 1-5
  content?: string | null;
  created_at: string; // ISO 8601 / RFC 3339
  updated_at: string;
}

export interface ReviewSummary {
  average_rating: number;
  total_reviews: number;
  rating_distribution: Record<number, number>; // rating (1-5) -> count
}

export interface Comment {
  id: string;
  project_ulid: string;
  user_ulid: string;
  parent_id?: string | null;
  content: string;
  attachments?: string | null; // JSON array of file IDs/URLs
  status: string; // 'active' | 'deleted'
  created_at: string;
  updated_at: string;
}

export interface FeedbackApiError {
  error: string;
  details?: string;
}

// ---------------------------------------------------------------------------
// Request error
// ---------------------------------------------------------------------------

class FeedbackRequestError extends Error {
  status: number;
  details?: string;

  constructor(message: string, status: number, details?: string) {
    super(message);
    this.name = "FeedbackRequestError";
    this.status = status;
    this.details = details;
  }
}

export { FeedbackRequestError };

// ---------------------------------------------------------------------------
// Review list / pagination params
// ---------------------------------------------------------------------------

export interface GetReviewsParams {
  limit?: number; // max 100, default 20
  cursor?: number; // Unix timestamp of last item from previous page
}

export interface GetCommentsParams {
  limit?: number;
  cursor?: number;
  parent_id?: string; // fetch replies for a specific parent comment
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

const useFeedbackApi = () => {
  const { user } = useAuth();

  // --- DID signing (identical to dpp.ts) ---

  const signBody = useCallback(
    async (body: string): Promise<{ "did-sign": string; "did-pk": string }> => {
      const zencode_exec = (await import("zenroom")).zencode_exec;
      const eddsaKey = typeof window !== "undefined" ? window.localStorage.getItem("eddsaPrivateKey") || "" : "";
      const data = `{"gql": "${Buffer.from(body, "utf8").toString("base64")}"}`;
      const keys = `{"keyring": {"eddsa": "${eddsaKey}"}}`;
      const { result } = await zencode_exec(sign, { data, keys });
      return {
        "did-sign": JSON.parse(result).eddsa_signature,
        "did-pk": String(user?.publicKey),
      };
    },
    [user?.publicKey]
  );

  // --- Generic request helper ---

  const request = useCallback(
    async <T>(method: string, path: string, body?: any): Promise<T> => {
      const url = `${FEEDBACK_BASE_URL}${path}`;
      const jsonBody = body != null ? JSON.stringify(body) : undefined;

      const headers: Record<string, string> = {};

      // Always send user ULID so backend can store/filter by it
      if (user?.ulid) {
        headers["x-user-id"] = user.ulid;
      }

      // Sign all mutating requests (POST, PUT, DELETE, PATCH)
      // even when body is empty (e.g. DELETE has no payload)
      if (method !== "GET" && method !== "OPTIONS") {
        const authHeaders = await signBody(jsonBody || "");
        Object.assign(headers, authHeaders);
        if (jsonBody) {
          headers["Content-Type"] = "application/json";
        }
      }

      const res = await fetch(url, { method, headers, body: jsonBody });

      if (!res.ok) {
        let apiError: FeedbackApiError = { error: res.statusText };
        try {
          apiError = await res.json();
        } catch {
          // response body may not be JSON
        }
        throw new FeedbackRequestError(apiError.error, res.status, apiError.details);
      }

      if (res.status === 204) return undefined as T;
      return res.json();
    },
    [signBody, user?.ulid]
  );

  // -----------------------------------------------------------------------
  // Reviews
  // -----------------------------------------------------------------------

  /** Create or update a review (1-5 stars + optional text). Auth required. */
  const createReview = useCallback(
    async (projectUlid: string, rating: number, content?: string): Promise<Review> => {
      return request<Review>("POST", `/api/v1/projects/${encodeURIComponent(projectUlid)}/reviews`, {
        rating,
        content: content || null,
      });
    },
    [request]
  );

  /** Fetch paginated reviews for a project. Public. */
  const getReviews = useCallback(
    async (projectUlid: string, params?: GetReviewsParams): Promise<{ reviews: Review[] }> => {
      const qs = new URLSearchParams();
      if (params?.limit != null) qs.set("limit", String(params.limit));
      if (params?.cursor != null) qs.set("cursor", String(params.cursor));

      const query = qs.toString();
      const path = `/api/v1/projects/${encodeURIComponent(projectUlid)}/reviews${query ? `?${query}` : ""}`;
      return request<{ reviews: Review[] }>("GET", path);
    },
    [request]
  );

  /** Fetch aggregated review stats for a project. Public. */
  const getReviewSummary = useCallback(
    async (projectUlid: string): Promise<ReviewSummary> => {
      return request<ReviewSummary>("GET", `/api/v1/projects/${encodeURIComponent(projectUlid)}/reviews/summary`);
    },
    [request]
  );

  // -----------------------------------------------------------------------
  // Comments
  // -----------------------------------------------------------------------

  /** Post a comment (optionally as a reply to parent_id). Auth required. */
  const createComment = useCallback(
    async (projectUlid: string, content: string, parentId?: string, attachments?: string): Promise<Comment> => {
      return request<Comment>("POST", `/api/v1/projects/${encodeURIComponent(projectUlid)}/comments`, {
        content,
        parent_id: parentId || null,
        attachments: attachments || null,
      });
    },
    [request]
  );

  /** Fetch paginated comments for a project. Public. */
  const getComments = useCallback(
    async (projectUlid: string, params?: GetCommentsParams): Promise<{ comments: Comment[] }> => {
      const qs = new URLSearchParams();
      if (params?.limit != null) qs.set("limit", String(params.limit));
      if (params?.cursor != null) qs.set("cursor", String(params.cursor));
      if (params?.parent_id) qs.set("parent_id", params.parent_id);

      const query = qs.toString();
      const path = `/api/v1/projects/${encodeURIComponent(projectUlid)}/comments${query ? `?${query}` : ""}`;
      return request<{ comments: Comment[] }>("GET", path);
    },
    [request]
  );

  /** Soft-delete a comment. Only the author can delete (enforced by backend). Auth required. */
  const deleteComment = useCallback(
    async (commentId: string): Promise<{ status: string }> => {
      // Send {} as body so signing has real data to work with (empty-body
      // signatures can fail Zenroom verification on the backend).
      return request<{ status: string }>("DELETE", `/api/v1/comments/${encodeURIComponent(commentId)}`, {});
    },
    [request]
  );

  // -----------------------------------------------------------------------
  // Return memoized API object
  // -----------------------------------------------------------------------

  return useMemo(
    () => ({
      createReview,
      getReviews,
      getReviewSummary,
      createComment,
      getComments,
      deleteComment,
    }),
    [createReview, getReviews, getReviewSummary, createComment, getComments, deleteComment]
  );
};

export default useFeedbackApi;
