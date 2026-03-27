// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { useQuery } from "@apollo/client";
import { AdjustmentsIcon, SearchIcon } from "@heroicons/react/outline";
import CatalogFilterSidebar, { CatalogVariant } from "components/CatalogFilterSidebar";
import EmptyState from "components/EmptyState";
import ProductCardSkeleton from "components/ProductCardSkeleton";
import ProjectCardNew from "components/ProjectCardNew";
import ToolbarDropdown from "components/ToolbarDropdown";
import useLoadMore from "hooks/useLoadMore";
import { FETCH_RESOURCES } from "lib/QueryAndMutation";
import { EconomicResource, EconomicResourceFilterParams, FetchInventoryQuery } from "lib/types";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React, { ReactNode, useState } from "react";

interface CatalogHeroProps {
  title: string;
  description: string;
  stats: ReactNode;
}

interface CatalogLayoutProps {
  variant: CatalogVariant;
  hero: CatalogHeroProps;
  searchPlaceholder: string;
  filter: EconomicResourceFilterParams;
  sortOptions?: string[];
  onDataLoaded?: (data: { totalCount: number; loading: boolean }) => void;
}

const SORT_OPTIONS_DEFAULT = ["Latest", "Most Popular", "A\u2013Z", "Z\u2013A"];

export default function CatalogLayout({
  variant,
  hero,
  searchPlaceholder,
  filter,
  sortOptions = SORT_OPTIONS_DEFAULT,
  onDataLoaded,
}: CatalogLayoutProps) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState((router.query.q as string) || "");

  const sortBy = (router.query.sort as string) || "Latest";
  const showFilter = (router.query.show as string) || "All";

  const handleSortChange = (value: string) => {
    const query = { ...router.query, sort: value };
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  const handleShowChange = (value: string) => {
    const query = { ...router.query, show: value };
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = { ...router.query };
    if (searchQuery.trim()) {
      query.q = searchQuery.trim();
    } else {
      delete query.q;
    }
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  // Apply search + tag filters from URL
  const tagsParam = router.query.tags as string | undefined;
  const tagsList = tagsParam ? tagsParam.split(",").map(t => encodeURI(t)) : undefined;

  const effectiveFilter: EconomicResourceFilterParams = {
    ...filter,
    ...(router.query.q && { orName: router.query.q as string }),
    ...(tagsList && tagsList.length > 0 && { classifiedAs: tagsList }),
  };

  const dataQueryIdentifier = "economicResources";
  const isFilterReady = !!effectiveFilter.conformsTo?.length;

  const { loading, data, fetchMore, refetch, variables, error } = useQuery<FetchInventoryQuery>(FETCH_RESOURCES, {
    variables: { last: 12, filter: effectiveFilter },
    skip: !isFilterReady,
  });

  const { loadMore, showEmptyState, items, getHasNextPage } = useLoadMore({
    fetchMore,
    refetch,
    variables,
    data,
    dataQueryIdentifier,
  });

  // Treat "waiting for filter" as loading to avoid premature empty state
  const isLoading = loading || !isFilterReady;
  const projects = items;
  const totalCount = data?.economicResources?.pageInfo?.totalCount || 0;
  const hasNext = !!getHasNextPage;

  // Notify parent of data changes
  React.useEffect(() => {
    if (onDataLoaded && data?.economicResources?.pageInfo) {
      onDataLoaded({ totalCount, loading: isLoading });
    }
  }, [data, isLoading, onDataLoaded, totalCount]);

  const heroGradients: Record<CatalogVariant, string> = {
    designs: "linear-gradient(83deg, rgb(3, 106, 83) 0%, rgb(57, 170, 145) 100%)",
    products: "linear-gradient(83deg, rgb(20, 59, 181) 0%, rgb(106, 140, 246) 100%)",
    services: "linear-gradient(83deg, rgb(130, 0, 219) 0%, rgb(193, 125, 240) 100%)",
  };

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Filter Sidebar */}
      <CatalogFilterSidebar
        variant={variant}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(v => !v)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Hero Section */}
        <div className="relative border-b border-ifr" style={{ background: heroGradients[variant] }}>
          <div className="relative px-6 py-10">
            <div className="relative z-10 flex items-center gap-6">
              {/* Left: Title + Description */}
              <div className="flex-1 flex flex-col">
                <h1
                  className="leading-9 mb-2"
                  style={{
                    fontFamily: "var(--ifr-font-heading)",
                    fontSize: "30px",
                    fontWeight: 700,
                    color: "#ffffff",
                  }}
                >
                  {hero.title}
                </h1>
                <p
                  className="leading-6 max-w-[640px]"
                  style={{ fontFamily: "var(--ifr-font-body)", fontSize: "16px", color: "#fafafa" }}
                >
                  {hero.description}
                </p>
              </div>

              {/* Right: Stats */}
              <div className="flex gap-[15px] shrink-0">{hero.stats}</div>
            </div>
          </div>
        </div>

        {/* Search & Sort Bar */}
        <div className="bg-ifr-surface border-b border-ifr px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Filters toggle */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(v => !v)}
              className={`flex items-center gap-2 px-3 shrink-0 border transition-colors cursor-pointer ${
                !sidebarCollapsed
                  ? "bg-ifr-hover border-ifr text-ifr-text-primary"
                  : "bg-ifr-surface border-transparent text-ifr-text-secondary hover:border-ifr hover:text-ifr-text-primary"
              }`}
              style={{ height: "var(--ifr-control-height)", borderRadius: "var(--ifr-radius-sm)" }}
              aria-label={sidebarCollapsed ? t("Show filters") : t("Hide filters")}
            >
              <AdjustmentsIcon className="w-4 h-4" />
              <span
                style={{
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-base)",
                  fontWeight: "var(--ifr-fw-medium)",
                }}
              >
                {t("Filters")}
              </span>
            </button>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-[845px] relative">
              <div className="bg-ifr-search border border-ifr rounded-full px-4 py-3 flex items-center gap-3">
                <SearchIcon className="w-5 h-5 text-ifr-text-secondary" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-ifr-text-primary placeholder:text-ifr-text-muted outline-none"
                  style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)" }}
                />
              </div>
            </form>

            {/* Sort & Show */}
            <div className="flex items-center gap-3 shrink-0">
              <ToolbarDropdown
                label={t("Show")}
                value={showFilter}
                options={["All", "Published", "Drafts", "Archived"]}
                onChange={handleShowChange}
              />
              <ToolbarDropdown label={t("Sort by")} value={sortBy} options={sortOptions} onChange={handleSortChange} />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-ifr-results flex-1 p-6">
          {/* Results count */}
          <p
            className="text-ifr-text-secondary mb-6"
            style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)" }}
          >
            {t("Showing") + " "}
            <span className="text-ifr-text-primary" style={{ fontWeight: "var(--ifr-fw-medium)" }}>
              {isLoading ? "..." : totalCount}
            </span>
            {" " + t("results")}
          </p>

          {/* Loading skeleton */}
          {isLoading && !data && (
            <div
              className="grid justify-center"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(var(--ifr-card-min-width), var(--ifr-card-max-width)))",
                gap: "var(--ifr-grid-gap)",
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-ifr-surface rounded-ifr-lg p-8 text-center border border-ifr">
              <h3
                className="text-lg font-medium text-ifr-text-primary mb-2"
                style={{ fontFamily: "var(--ifr-font-heading)" }}
              >
                {t("Error loading projects")}
              </h3>
              <p className="text-sm text-ifr-text-secondary mb-4">{error.message}</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-ifr-md"
                style={{ backgroundColor: "var(--ifr-green)" }}
              >
                {t("Try Again")}
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && (showEmptyState || !projects?.length) && (
            <EmptyState heading="No projects match your filters" />
          )}

          {/* Cards Grid */}
          {projects && projects.length > 0 && (
            <>
              <div
                className="grid justify-center"
                style={{
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(var(--ifr-card-min-width), var(--ifr-card-max-width)))",
                  gap: "var(--ifr-grid-gap)",
                }}
              >
                {projects.map(({ node }: { node: EconomicResource }) => (
                  <ProjectCardNew key={node.id} project={node} />
                ))}
              </div>

              {/* Load more */}
              {hasNext && (
                <div className="flex justify-center mt-8">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={isLoading}
                    className="px-6 py-2.5 border border-ifr rounded-ifr-md text-ifr-text-primary hover:bg-ifr-hover transition-colors"
                    style={{
                      fontFamily: "var(--ifr-font-body)",
                      fontSize: "var(--ifr-fs-base)",
                      fontWeight: "var(--ifr-fw-medium)",
                    }}
                  >
                    {isLoading ? t("Loading...") : t("Load more")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Reusable stat card for hero sections — compact prototype style */
export function HeroStatCard({ value, label }: { icon?: ReactNode; value: string | number; label: string }) {
  return (
    <div
      className="flex flex-col justify-center"
      style={{
        width: 140,
        height: 56,
        padding: "10px 14px",
        borderRadius: "6px",
        background: "#ffffff",
        border: "1px solid #c9cccf",
      }}
    >
      <span
        style={{
          fontFamily: "var(--ifr-font-body)",
          fontSize: 16,
          fontWeight: 700,
          color: "#0b1324",
          lineHeight: "1.2",
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: "var(--ifr-font-body)",
          fontSize: 12,
          fontWeight: 400,
          color: "#6c707c",
          lineHeight: "1.2",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/** Stat icon wrapper for consistent sizing/coloring */
export function StatIcon({ children, bgColor }: { children: ReactNode; bgColor: string }) {
  return (
    <div className="rounded-md w-9 h-9 flex items-center justify-center" style={{ backgroundColor: bgColor }}>
      {children}
    </div>
  );
}
