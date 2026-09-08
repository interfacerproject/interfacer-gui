// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import useFilters from "hooks/useFilters";
import { useIsDesktop } from "hooks/useMediaQuery";
import { EconomicResourceFilterParams } from "lib/types";
import { useTranslation } from "next-i18next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { ALL_CATEGORIES, SearchCategory } from "./constants";
import NoQueryPrompt from "./NoQueryPrompt";
import SearchAllView from "./SearchAllView";
import SearchCategoryTabs from "./SearchCategoryTabs";
import SearchFilterPanel from "./SearchFilterPanel";
import SearchHeader from "./SearchHeader";
import SearchResultsGrid from "./SearchResultsGrid";
import SearchToolbar from "./SearchToolbar";
import { useSearchQueries } from "./useSearchQueries";

const ProjectsMaps = dynamic(() => import("components/ProjectsMaps"), { ssr: false });

type TabId = "all" | SearchCategory;
const VALID_TABS: TabId[] = ["all", ...ALL_CATEGORIES];

export default function SearchResults() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const { designId, productId, serviceId, machineId } = useFilters();

  const q = typeof router.query.q === "string" ? router.query.q : "";
  const rawCat = typeof router.query.cat === "string" ? (router.query.cat as TabId) : "all";
  const activeTab: TabId = VALID_TABS.includes(rawCat) ? rawCat : "all";
  const view: "list" | "map" = router.query.view === "map" ? "map" : "list";
  const sort = typeof router.query.sort === "string" ? router.query.sort : "Relevance";
  const descriptionSearch = router.query.desc !== "0";
  const rawTags = router.query.tags;
  const tags = useMemo(() => {
    if (!rawTags) return [] as string[];
    return (typeof rawTags === "string" ? rawTags.split(",") : rawTags).map(decodeURI);
  }, [rawTags]);
  const { nearLat, nearLong, nearDistanceKm } = router.query;
  const near = useMemo(() => {
    if (typeof nearLat === "string" && typeof nearLong === "string" && typeof nearDistanceKm === "string") {
      return { lat: nearLat, long: nearLong, distanceKm: nearDistanceKm };
    }
    return undefined;
  }, [nearLat, nearLong, nearDistanceKm]);

  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [drawerCollapsed, setDrawerCollapsed] = useState(true);
  const sidebarCollapsed = isDesktop ? desktopCollapsed : drawerCollapsed;
  const toggleSidebar = () => (isDesktop ? setDesktopCollapsed(v => !v) : setDrawerCollapsed(v => !v));

  const setQuery = (patch: Record<string, string | null>) => {
    const query = { ...router.query };
    Object.entries(patch).forEach(([key, value]) => {
      if (value === null) delete query[key];
      else query[key] = value;
    });
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  /** Keep the current `view` param when switching tabs — except People, which has no map. */
  const viewPatchFor = (c: TabId): string | null => {
    if (c === "people") return null;
    return typeof router.query.view === "string" ? router.query.view : null;
  };

  const { byCategory, totalCount } = useSearchQueries({ q, descriptionSearch, tags, near, sort });
  const counts = ALL_CATEGORIES.reduce((acc, c) => {
    acc[c] = byCategory[c].count;
    return acc;
  }, {} as Record<SearchCategory, number | null>);

  if (!q) return <NoQueryPrompt />;

  const allResolved = ALL_CATEGORIES.every(c => typeof counts[c] === "number");
  const nothingFound = allResolved && ALL_CATEGORIES.every(c => counts[c] === 0);

  const showViewToggle = activeTab !== "people";
  const effectiveView = showViewToggle ? view : "list";

  // Map filter: active category's spec, or the union of all four on "All".
  const mapSpecIds = [designId, productId, serviceId, machineId].filter(Boolean) as string[];
  const catSpec: Record<SearchCategory, string | undefined> = {
    designs: designId,
    products: productId,
    services: serviceId,
    machines: machineId,
    people: undefined,
  };
  const activeSpecIds =
    activeTab === "all" || activeTab === "people" ? mapSpecIds : ([catSpec[activeTab]].filter(Boolean) as string[]);
  const mapFilter: Partial<EconomicResourceFilterParams> = {
    // The backend rejects an empty list, so send nothing until the specs resolve.
    ...(activeSpecIds.length > 0 && { conformsTo: activeSpecIds }),
    ...(q && { orName: q }),
    ...(q && descriptionSearch && { orNote: q }),
    ...(tags.length > 0 && { classifiedAs: tags.map(encodeURI) }),
    ...(near && { nearLat: near.lat, nearLong: near.long, nearDistanceKm: near.distanceKm }),
    // Mirrors buildResourceFilter in useSearchQueries, so the map hides what the list hides.
    ...(process.env.NEXT_PUBLIC_LOSH_ID && { notCustodian: [process.env.NEXT_PUBLIC_LOSH_ID] }),
  };

  return (
    <div className="flex flex-col min-w-0">
      <SearchHeader q={q} totalCount={totalCount} />
      {!nothingFound && (
        <SearchCategoryTabs
          active={activeTab}
          counts={counts}
          onSelect={c => setQuery({ cat: c === "all" ? null : c, view: viewPatchFor(c) })}
        />
      )}

      {nothingFound ? (
        <div className="flex flex-col items-center text-center gap-4 py-20 px-4">
          <h2
            className="text-ifr-text-primary"
            style={{
              fontFamily: "var(--ifr-font-heading)",
              fontSize: "var(--ifr-fs-xl)",
              fontWeight: "var(--ifr-fw-bold)",
            }}
          >
            {t("Nothing found for “{{q}}”", { q })}
          </h2>
          <p className="text-ifr-text-secondary" style={{ fontFamily: "var(--ifr-font-body)" }}>
            {t("Check spelling, use fewer or different words, or browse:")}
          </p>
          <div className="flex gap-4 text-ifr-green" style={{ fontFamily: "var(--ifr-font-body)" }}>
            <Link href="/designs">
              <a className="hover:underline">{t("Designs")}</a>
            </Link>
            <Link href="/products">
              <a className="hover:underline">{t("Products")}</a>
            </Link>
            <Link href="/services">
              <a className="hover:underline">{t("Services")}</a>
            </Link>
            <Link href={{ pathname: router.pathname, query: { ...router.query, view: "map" } }}>
              <a className="hover:underline">{t("Map")}</a>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <SearchToolbar
            q={q}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={toggleSidebar}
            sort={sort}
            onSortChange={v => setQuery({ sort: v === "Relevance" ? null : v })}
            view={effectiveView}
            onViewChange={v => setQuery({ view: v === "list" ? null : v })}
            showViewToggle={showViewToggle}
            onSubmitQuery={next => setQuery({ q: next || null })}
          />

          <div className="flex flex-1 items-start min-w-0">
            <SearchFilterPanel collapsed={sidebarCollapsed} onToggle={toggleSidebar} asDrawer={!isDesktop} />

            <div className="flex-1 min-w-0 bg-ifr-results p-4 md:p-6">
              {effectiveView === "map" ? (
                <ProjectsMaps filters={mapFilter} bare />
              ) : activeTab === "all" ? (
                <SearchAllView
                  byCategory={byCategory}
                  q={q}
                  onOpenCategory={c => setQuery({ cat: c, view: viewPatchFor(c) })}
                />
              ) : (
                <SearchResultsGrid category={activeTab} result={byCategory[activeTab]} q={q} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
