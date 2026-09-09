// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

/**
 * ReviewBadge – compact "★ 4.8 (24)" pill for project cards.
 *
 * Fetches the aggregated review summary for a project and renders the average
 * rating plus the number of reviews. Renders nothing while loading, on error,
 * or when the project has no reviews yet.
 */

import { StarIcon as StarIconSolid } from "@heroicons/react/solid";
import useFeedbackApi, { type ReviewSummary } from "lib/feedback";
import { useTranslation } from "next-i18next";
import React from "react";

// Module-level cache so a grid of cards doesn't refetch the same project.
const summaryCache = new Map<string, ReviewSummary | null>();

interface ReviewBadgeProps {
  projectId?: string;
  /** Visual variant: "overlay" sits on the card image, "inline" on a light surface. */
  variant?: "overlay" | "inline";
}

export default function ReviewBadge({ projectId, variant = "overlay" }: ReviewBadgeProps) {
  const { t } = useTranslation("common");
  const api = useFeedbackApi();
  const [summary, setSummary] = React.useState<ReviewSummary | null>(
    projectId ? summaryCache.get(projectId) ?? null : null
  );

  React.useEffect(() => {
    if (!projectId || summaryCache.has(projectId)) return;
    let cancelled = false;
    api
      .getReviewSummary(projectId)
      .then(res => {
        if (cancelled) return;
        summaryCache.set(projectId, res);
        setSummary(res);
      })
      .catch(() => {
        if (cancelled) return;
        summaryCache.set(projectId, null);
        setSummary(null);
      });
    return () => {
      cancelled = true;
    };
  }, [api, projectId]);

  if (!summary || summary.total_reviews === 0) return null;

  const isOverlay = variant === "overlay";

  return (
    <div
      className="flex items-center gap-1 px-2 py-1"
      style={{
        backgroundColor: isOverlay ? "var(--ifr-overlay-dark)" : "var(--ifr-hover)",
        borderRadius: "var(--ifr-radius-sm)",
      }}
    >
      <StarIconSolid className="w-5 h-5 text-ifr-yellow" />
      <span
        className={isOverlay ? "text-white" : "text-ifr-text-primary"}
        style={{
          fontFamily: "var(--ifr-font-body)",
          fontSize: "var(--ifr-fs-base)",
          fontWeight: "var(--ifr-fw-medium)",
        }}
      >
        {t("{{rating}} ({{count}})", {
          rating: summary.average_rating.toFixed(1),
          count: summary.total_reviews,
        })}
      </span>
    </div>
  );
}
