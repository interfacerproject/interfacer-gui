// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import ProductCardSkeleton from "components/ProductCardSkeleton";
import ProjectCardNew from "components/ProjectCardNew";
import EmptyState from "components/EmptyState";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import AgentCard from "./AgentCard";
import { CATEGORY_PROJECT_TYPE, CATEGORY_SINGULAR_KEY, SearchCategory } from "./constants";
import type { CategoryResult } from "./useSearchQueries";

interface Props {
  category: SearchCategory;
  result: CategoryResult;
  q: string;
  limit?: number;
  showCount?: boolean;
}

const GRID_STYLE: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, var(--ifr-card-track))",
  gap: "var(--ifr-grid-gap)",
  justifyContent: "center",
};

export default function SearchResultsGrid({ category, result, q, limit, showCount = true }: Props) {
  const { t } = useTranslation("common");
  const { items, loading, error, hasNext, loadMore, refetch } = result;
  const visible = typeof limit === "number" ? items.slice(0, limit) : items;

  if (loading) {
    return (
      <div style={GRID_STYLE}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-ifr-surface rounded-ifr-lg p-8 text-center border border-ifr">
        <h3
          className="text-lg font-medium text-ifr-text-primary mb-2"
          style={{ fontFamily: "var(--ifr-font-heading)" }}
        >
          {t("Couldn't load {{category}}", { category: t(CATEGORY_SINGULAR_KEY[category]) })}
        </h3>
        <p className="text-sm text-ifr-text-secondary mb-4">{error.message}</p>
        <button
          type="button"
          onClick={refetch}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-ifr-md"
          style={{ backgroundColor: "var(--ifr-green)" }}
        >
          {t("Try Again")}
        </button>
      </div>
    );
  }

  if (!visible.length) {
    return (
      <EmptyState
        heading={t("No {{category}} match “{{q}}”", { category: t(CATEGORY_SINGULAR_KEY[category]), q })}
        description={t("Try removing filters or searching fewer words.")}
      />
    );
  }

  return (
    <>
      {showCount && (
        <p
          className="text-ifr-text-secondary"
          style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)", marginBottom: 24 }}
        >
          {t("Showing") + " "}
          <span className="text-ifr-text-primary" style={{ fontWeight: "var(--ifr-fw-medium)" }}>
            {/* The server-side total when known, so paging doesn't understate the result set. */}
            {result.count ?? visible.length}
          </span>
          {" " + t("results")}
        </p>
      )}

      <div style={GRID_STYLE}>
        {category === "people"
          ? visible.map(({ node }: any) => <AgentCard key={node.id} agent={node} />)
          : visible.map(({ node }: { node: EconomicResource }) => (
              <ProjectCardNew key={node.id} project={node} forcedType={CATEGORY_PROJECT_TYPE[category]} />
            ))}
      </div>

      {typeof limit !== "number" && hasNext && (
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={loadMore}
            className="px-6 py-2.5 border border-ifr rounded-ifr-md text-ifr-text-primary hover:bg-ifr-hover transition-colors"
            style={{
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-base)",
              fontWeight: "var(--ifr-fw-medium)",
            }}
          >
            {t("Load more")}
          </button>
        </div>
      )}
    </>
  );
}
