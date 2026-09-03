/**
 * Feedback hook — thin wrapper around client.feedback SDK module.
 *
 * Provides a React hook `useFeedbackApi` with typed methods for reviews and comments.
 * Now delegates all HTTP + signing to the SDK's FeedbackClient instead of raw fetch.
 */

import { useAuth } from "hooks/useAuth";
import {
  type Review,
  type ReviewSummary,
  type Comment,
  type GetReviewsParams,
  type GetCommentsParams,
} from "@dyne/interfacer-client";
import { useMemo } from "react";

// Re-export types for backward compatibility
export type { Review, ReviewSummary, Comment, GetReviewsParams, GetCommentsParams } from "@dyne/interfacer-client";

// ---------------------------------------------------------------------------
// Request error (retained for backward compat)
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
export type FeedbackApiError = { error: string; details?: string };

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

const useFeedbackApi = () => {
  const { user, client } = useAuth();

  return useMemo(() => {
    // Return stub when client is not ready (matches pre-SDK behavior)
    const empty = () => {
      throw new Error("Feedback API not available");
    };

    return {
      createReview: client
        ? (projectUlid: string, rating: number, content?: string) =>
            client.feedback.createReview(projectUlid, rating, content)
        : empty,

      getReviews: client
        ? (projectUlid: string, params?: GetReviewsParams) => client.feedback.getReviews(projectUlid, params)
        : empty,

      getReviewSummary: client ? (projectUlid: string) => client.feedback.getReviewSummary(projectUlid) : empty,

      getUserReview: client ? (projectUlid: string) => client.feedback.getUserReview(projectUlid) : empty,

      deleteReview: client ? (reviewId: string) => client.feedback.deleteReview(reviewId) : empty,

      createComment: client
        ? (projectUlid: string, content: string, parentId?: string, attachments?: string) =>
            client.feedback.createComment(projectUlid, content, parentId, attachments)
        : empty,

      getComments: client
        ? (projectUlid: string, params?: GetCommentsParams) => client.feedback.getComments(projectUlid, params)
        : empty,

      deleteComment: client ? (commentId: string) => client.feedback.deleteComment(commentId) : empty,
    };
  }, [client]);
};

export default useFeedbackApi;
