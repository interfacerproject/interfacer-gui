// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { useQuery } from "@apollo/client";
import {
  Add,
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Information,
  OverflowMenuVertical,
  Search,
  SortAscending,
} from "@carbon/icons-react";
import { ExternalLinkIcon, LocationMarkerIcon } from "@heroicons/react/outline";
import BrUserAvatar from "components/brickroom/BrUserAvatar";
import EntityTypeIcon from "components/EntityTypeIcon";
import { useUser } from "components/layout/FetchUserLayout";
import ProjectCardNew from "components/ProjectCardNew";
import { ProjectType } from "components/types";
import { useAuth } from "hooks/useAuth";
import useFilters from "hooks/useFilters";
import useLoadMore from "hooks/useLoadMore";
import useDppApi from "lib/dpp";
import type { DppDocument, DppStatus, ListDppsResponse, StatusFacets } from "lib/dpp-types";
import { FETCH_RESOURCES } from "lib/QueryAndMutation";
import { FetchInventoryQuery } from "lib/types";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

// ─── Tab definitions ────────────────────────────────────────────────────────

type ProfileTabId = "designs" | "products" | "services" | "dpps" | "community";

interface TabDef {
  id: ProfileTabId;
  labelKey: string;
  type: ProjectType;
}

const tabs: TabDef[] = [
  { id: "designs", labelKey: "Designs", type: ProjectType.DESIGN },
  { id: "products", labelKey: "Products", type: ProjectType.PRODUCT },
  { id: "services", labelKey: "Services", type: ProjectType.SERVICE },
  { id: "dpps", labelKey: "DPPs", type: ProjectType.DPP },
];

// ─── Per-tab CTA & toolbar config ───────────────────────────────────────────

interface TabCtaConfig {
  ctaTitle: string;
  ctaDescription: string;
  createLabel: string;
  createUrl: string;
  searchPlaceholder: string;
}

const tabCtaConfig: Record<Exclude<ProfileTabId, "community">, TabCtaConfig> = {
  designs: {
    ctaTitle: "Publish your design documentation",
    ctaDescription:
      "Allow the world to see, build and replicate your design. Add all the relevant info to help other users discover your work.",
    createLabel: "Create a new Design",
    createUrl: "/create/project/design",
    searchPlaceholder: "Search designs by name, tags...",
  },
  products: {
    ctaTitle: "Turn designs into manufacturable products",
    ctaDescription:
      "Create a product listing on Interfacer. Products are displayed inside the design page and in the Products Catalog.",
    createLabel: "Create a new Product",
    createUrl: "/create/project/product",
    searchPlaceholder: "Search products by name, tags...",
  },
  services: {
    ctaTitle: "Offer your skills and services",
    ctaDescription:
      "List your workshop, lab, or service. Help makers find the equipment and expertise they need to build their projects.",
    createLabel: "Create a new Service",
    createUrl: "/create/project/service",
    searchPlaceholder: "Search services by name, tags...",
  },
  dpps: {
    ctaTitle: "Publish DPPs for your products",
    ctaDescription:
      "With a Digital Product Passport (DPP) each product gets a unique QR code for easy tracking and verification.",
    createLabel: "Publish a New DPP",
    createUrl: "/dpps/new",
    searchPlaceholder: "Search DPPs by batch ID, status...",
  },
};

// ─── Profile Tab Content ────────────────────────────────────────────────────

function ProfileTabContent({
  userId,
  specId,
  tabType,
  isOwner,
  ctaConfig,
}: {
  userId: string;
  specId?: string;
  tabType: ProjectType;
  isOwner: boolean;
  ctaConfig: TabCtaConfig;
}) {
  const { t } = useTranslation("common");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const filter = useMemo(
    () => ({
      primaryAccountable: [userId],
      conformsTo: specId ? [specId] : undefined,
    }),
    [userId, specId]
  );

  const dataQueryIdentifier = "economicResources";

  const { loading, data, fetchMore, refetch, variables } = useQuery<FetchInventoryQuery>(FETCH_RESOURCES, {
    variables: { last: 12, filter },
  });

  const { loadMore, showEmptyState, items, getHasNextPage } = useLoadMore({
    fetchMore,
    refetch,
    variables,
    data,
    dataQueryIdentifier,
  });

  const projects = items;
  const hasNext = !!getHasNextPage;

  return (
    <div className="flex flex-col gap-5">
      {/* CTA + Stats row (owner only) */}
      {isOwner && (
        <div className="flex flex-col md:flex-row gap-6 py-6">
          {/* Left: CTA */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h3
                className="text-ifr-text-primary m-0"
                style={{
                  fontFamily: "var(--ifr-font-heading)",
                  fontSize: "var(--ifr-fs-lg)",
                  fontWeight: "var(--ifr-fw-bold)",
                  lineHeight: "1.3",
                }}
              >
                {t(ctaConfig.ctaTitle)}
              </h3>
              <p
                className="text-ifr-text-secondary m-0"
                style={{
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-md)",
                  lineHeight: "1.5",
                }}
              >
                {t(ctaConfig.ctaDescription)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={ctaConfig.createUrl}>
                <a
                  className="flex items-center gap-2 px-4 no-underline transition-colors hover:opacity-90"
                  style={{
                    height: "var(--ifr-control-height)",
                    borderRadius: "var(--ifr-radius-sm)",
                    backgroundColor: "var(--ifr-yellow)",
                    fontFamily: "var(--ifr-font-body)",
                    fontSize: "var(--ifr-fs-base)",
                    fontWeight: "var(--ifr-fw-medium)",
                    color: "var(--ifr-text-primary)",
                  }}
                >
                  {t(ctaConfig.createLabel)}
                  <ArrowRight size={16} />
                </a>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Search & Sort toolbar */}
      <div
        className="bg-ifr-surface border border-ifr rounded-ifr-md flex items-center gap-3 px-4"
        style={{ minHeight: "var(--ifr-control-height)", padding: "12px 16px" }}
      >
        {/* Search input */}
        <div className="flex-1 flex items-center gap-3">
          <Search size={18} className="text-ifr-text-secondary shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t(ctaConfig.searchPlaceholder)}
            className="flex-1 bg-transparent border-none outline-none text-ifr-text-primary"
            style={{
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-base)",
            }}
          />
        </div>

        {/* Sort dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 px-3 bg-transparent border border-ifr cursor-pointer hover:bg-ifr-hover transition-colors"
            style={{
              height: "36px",
              borderRadius: "var(--ifr-radius-sm)",
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-sm)",
              fontWeight: "var(--ifr-fw-medium)",
              color: "var(--ifr-text-secondary)",
            }}
          >
            <SortAscending size={14} />
            {t("Sort by")} {sortBy === "latest" ? t("Latest") : t("Oldest")}
          </button>
          {showSortMenu && (
            <div
              className="absolute right-0 top-full mt-1 bg-ifr-surface border border-ifr shadow-lg z-20"
              style={{ borderRadius: "var(--ifr-radius-sm)", minWidth: "160px" }}
            >
              {["latest", "oldest"].map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSortBy(opt);
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 border-none cursor-pointer transition-colors ${
                    sortBy === opt ? "bg-ifr-hover" : "bg-transparent hover:bg-ifr-hover/50"
                  }`}
                  style={{
                    fontFamily: "var(--ifr-font-body)",
                    fontSize: "var(--ifr-fs-sm)",
                    color: "var(--ifr-text-primary)",
                  }}
                >
                  {opt === "latest" ? t("Latest") : t("Oldest")}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Create button (owner only) */}
        {isOwner && (
          <Link href={ctaConfig.createUrl}>
            <a
              className="flex items-center gap-2 px-3 no-underline shrink-0 transition-colors hover:opacity-90"
              style={{
                height: "36px",
                borderRadius: "var(--ifr-radius-sm)",
                backgroundColor: "var(--ifr-yellow)",
                fontFamily: "var(--ifr-font-body)",
                fontSize: "var(--ifr-fs-sm)",
                fontWeight: "var(--ifr-fw-medium)",
                color: "var(--ifr-text-primary)",
              }}
            >
              <Add size={16} />
              {t(ctaConfig.createLabel)}
            </a>
          </Link>
        )}
      </div>

      {/* Results grid */}
      {loading && !projects?.length ? (
        <div className="flex items-center justify-center py-20">
          <div
            className="animate-spin rounded-full border-2 border-ifr border-t-ifr-green"
            style={{ width: 32, height: 32 }}
          />
        </div>
      ) : showEmptyState ? (
        <div className="bg-ifr-surface border border-ifr rounded-ifr-md p-12 text-center">
          <EntityTypeIcon type={tabType} size="default" className="mx-auto mb-3 opacity-40" />
          <p
            className="text-ifr-text-secondary"
            style={{
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-md)",
            }}
          >
            {t("No items yet")}
          </p>
        </div>
      ) : (
        <div
          className="grid gap-5"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(var(--ifr-card-min-width, 280px), 1fr))",
          }}
        >
          {projects?.map((edge: any) => (
            <ProjectCardNew key={edge.node.id} project={edge.node} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasNext && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="bg-ifr-surface border border-ifr hover:bg-ifr-hover transition-colors cursor-pointer"
            style={{
              height: "var(--ifr-control-height)",
              borderRadius: "var(--ifr-radius-sm)",
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-base)",
              fontWeight: "var(--ifr-fw-medium)",
              padding: "0 20px",
              color: "var(--ifr-text-primary)",
            }}
          >
            {loading ? t("Loading...") : t("Load more")}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── DPPs Tab ───────────────────────────────────────────────────────────

function DppsTabContent({ userId, isOwner, ctaConfig }: { userId: string; isOwner: boolean; ctaConfig: TabCtaConfig }) {
  const { t } = useTranslation("common");
  const dppApi = useDppApi();
  const [dpps, setDpps] = useState<DppDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "az" | "za">("latest");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "archived">("all");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [facets, setFacets] = useState<StatusFacets>({ active: 0, draft: 0, archived: 0 });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    dppApi
      .listDpps({ createdBy: userId, limit: 50 })
      .then((res: ListDppsResponse) => {
        if (!cancelled) {
          setDpps(res.dpps || []);
          setTotal(res.total || 0);
          if (res.facets) setFacets(res.facets);
        }
      })
      .catch((err: Error) => {
        console.error("Failed to load DPPs:", err);
        if (!cancelled) {
          setDpps([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close menus on outside click
  useEffect(() => {
    const handler = () => {
      setShowSortMenu(false);
      setShowFilterMenu(false);
      setShowActionsMenu(null);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // KPI counters: use backend facets when available, client-side fallback
  const statusCounts = useMemo(() => {
    if (facets.active + facets.draft + facets.archived > 0) {
      return {
        total: facets.active + facets.draft + facets.archived,
        ...facets,
      };
    }
    const counts = { total: dpps.length, active: 0, draft: 0, archived: 0 };
    for (const d of dpps) {
      if (d.status === "active") counts.active++;
      else if (d.status === "draft") counts.draft++;
      else if (d.status === "archived") counts.archived++;
    }
    return counts;
  }, [dpps, facets]);

  const filteredDpps = useMemo(() => {
    let items = dpps;

    // Status filter
    if (statusFilter !== "all") {
      items = items.filter(d => d.status === statusFilter);
    }

    // Text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        d =>
          d.id?.toLowerCase().includes(q) ||
          d.productId?.toLowerCase().includes(q) ||
          d.batchId?.toLowerCase().includes(q) ||
          d.status?.toLowerCase().includes(q) ||
          d.batchType?.toLowerCase().includes(q) ||
          d.productOverview?.productName?.value?.toLowerCase().includes(q) ||
          d.productOverview?.brandName?.value?.toLowerCase().includes(q)
      );
    }

    // Sort
    items = [...items];
    switch (sortBy) {
      case "oldest":
        items.reverse();
        break;
      case "az":
        items.sort((a, b) => {
          const na = a.productOverview?.productName?.value || "";
          const nb = b.productOverview?.productName?.value || "";
          return na.localeCompare(nb);
        });
        break;
      case "za":
        items.sort((a, b) => {
          const na = a.productOverview?.productName?.value || "";
          const nb = b.productOverview?.productName?.value || "";
          return nb.localeCompare(na);
        });
        break;
    }
    return items;
  }, [dpps, searchQuery, sortBy, statusFilter]);

  const statusColors: Record<string, { bg: string; text: string }> = {
    active: { bg: "var(--ifr-green)", text: "#fff" },
    draft: { bg: "var(--ifr-gray, #6C707C)", text: "#fff" },
    archived: { bg: "var(--ifr-yellow)", text: "var(--ifr-text-primary)" },
  };

  const sortLabels: Record<string, string> = {
    latest: "Latest",
    oldest: "Oldest",
    az: "A–Z",
    za: "Z–A",
  };

  const filterLabels: Record<string, string> = {
    all: "All",
    active: "Active",
    draft: "Drafts",
    archived: "Archived",
  };

  const handleStatusChange = async (dppId: string, newStatus: DppStatus) => {
    try {
      await dppApi.updateDppStatus(dppId, newStatus);
      setDpps(prev => prev.map(d => (d.id === dppId ? { ...d, status: newStatus } : d)));
    } catch (err) {
      console.error("Failed to update DPP status:", err);
    }
    setShowActionsMenu(null);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* CTA + KPI Stats row (owner only) */}
      {isOwner && (
        <div className="flex flex-col md:flex-row gap-6 py-6">
          {/* CTA left */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h3
                className="text-ifr-text-primary m-0"
                style={{
                  fontFamily: "var(--ifr-font-heading)",
                  fontSize: "var(--ifr-fs-lg)",
                  fontWeight: "var(--ifr-fw-bold)",
                  lineHeight: "1.3",
                }}
              >
                {t(ctaConfig.ctaTitle)}
              </h3>
              <p
                className="text-ifr-text-secondary m-0"
                style={{
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-md)",
                  lineHeight: "1.5",
                }}
              >
                {t(ctaConfig.ctaDescription)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={ctaConfig.createUrl}>
                <a
                  className="flex items-center gap-2 px-4 no-underline transition-colors hover:opacity-90"
                  style={{
                    height: "var(--ifr-control-height)",
                    borderRadius: "var(--ifr-radius-sm)",
                    backgroundColor: "var(--ifr-yellow)",
                    fontFamily: "var(--ifr-font-body)",
                    fontSize: "var(--ifr-fs-base)",
                    fontWeight: "var(--ifr-fw-medium)",
                    color: "var(--ifr-text-primary)",
                  }}
                >
                  <Add size={16} />
                  {t(ctaConfig.createLabel)}
                </a>
              </Link>
              <button
                type="button"
                className="flex items-center gap-2 px-4 bg-transparent border-none cursor-pointer hover:underline"
                style={{
                  height: "var(--ifr-control-height)",
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-base)",
                  fontWeight: "var(--ifr-fw-medium)",
                  color: "var(--ifr-text-secondary)",
                }}
              >
                <Information size={16} />
                {t("Learn more about DPPs")}
              </button>
            </div>
          </div>

          {/* KPI Stats right */}
          <div
            className="grid grid-cols-2 gap-px border border-ifr rounded-ifr-md overflow-hidden shrink-0"
            style={{ width: "320px" }}
          >
            {(
              [
                { label: "Total DPPs", value: statusCounts.total },
                { label: "Active", value: statusCounts.active },
                { label: "Drafts", value: statusCounts.draft },
                { label: "Archived", value: statusCounts.archived },
              ] as const
            ).map(kpi => (
              <div key={kpi.label} className="bg-ifr-surface p-4 flex flex-col gap-1">
                <span
                  className="text-ifr-text-secondary"
                  style={{
                    fontFamily: "var(--ifr-font-body)",
                    fontSize: "var(--ifr-fs-sm)",
                  }}
                >
                  {t(kpi.label)}
                </span>
                <span
                  className="text-ifr-text-primary"
                  style={{
                    fontFamily: "var(--ifr-font-heading)",
                    fontSize: "var(--ifr-fs-2xl)",
                    fontWeight: "var(--ifr-fw-bold)",
                    lineHeight: "1.2",
                  }}
                >
                  {kpi.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Sort & Filter toolbar */}
      <div
        className="bg-ifr-surface border border-ifr rounded-ifr-md flex items-center gap-3 px-4"
        style={{ minHeight: "var(--ifr-control-height)", padding: "12px 16px" }}
      >
        <div className="flex-1 flex items-center gap-3">
          <Search size={18} className="text-ifr-text-secondary shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t("Search by product name, DPP ID, or project ID...")}
            className="flex-1 bg-transparent border-none outline-none text-ifr-text-primary"
            style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)" }}
          />
        </div>

        {/* Sort dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              setShowSortMenu(!showSortMenu);
              setShowFilterMenu(false);
            }}
            className="flex items-center gap-2 px-3 bg-transparent border border-ifr cursor-pointer hover:bg-ifr-hover transition-colors"
            style={{
              height: "36px",
              borderRadius: "var(--ifr-radius-sm)",
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-sm)",
              fontWeight: "var(--ifr-fw-medium)",
              color: "var(--ifr-text-secondary)",
            }}
          >
            <span>{t("Sort by")}</span>
            <span className="text-ifr-text-primary" style={{ fontWeight: "var(--ifr-fw-semibold)" }}>
              {t(sortLabels[sortBy])}
            </span>
            <ChevronDown size={14} />
          </button>
          {showSortMenu && (
            <div
              className="absolute right-0 top-full mt-1 bg-ifr-surface border border-ifr shadow-lg z-20"
              style={{ borderRadius: "var(--ifr-radius-sm)", minWidth: "160px" }}
            >
              {(["latest", "oldest", "az", "za"] as const).map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setSortBy(opt);
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 border-none cursor-pointer transition-colors ${
                    sortBy === opt ? "bg-ifr-hover" : "bg-transparent hover:bg-ifr-hover/50"
                  }`}
                  style={{
                    fontFamily: "var(--ifr-font-body)",
                    fontSize: "var(--ifr-fs-sm)",
                    color: "var(--ifr-text-primary)",
                  }}
                >
                  {t(sortLabels[opt])}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status filter dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              setShowFilterMenu(!showFilterMenu);
              setShowSortMenu(false);
            }}
            className="flex items-center gap-2 px-3 bg-transparent border border-ifr cursor-pointer hover:bg-ifr-hover transition-colors"
            style={{
              height: "36px",
              borderRadius: "var(--ifr-radius-sm)",
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-sm)",
              fontWeight: "var(--ifr-fw-medium)",
              color: "var(--ifr-text-secondary)",
            }}
          >
            <span>{t("Show")}</span>
            <span className="text-ifr-text-primary" style={{ fontWeight: "var(--ifr-fw-semibold)" }}>
              {t(filterLabels[statusFilter])}
            </span>
            <ChevronDown size={14} />
          </button>
          {showFilterMenu && (
            <div
              className="absolute right-0 top-full mt-1 bg-ifr-surface border border-ifr shadow-lg z-20"
              style={{ borderRadius: "var(--ifr-radius-sm)", minWidth: "160px" }}
            >
              {(["all", "active", "draft", "archived"] as const).map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setStatusFilter(opt);
                    setShowFilterMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 border-none cursor-pointer transition-colors ${
                    statusFilter === opt ? "bg-ifr-hover" : "bg-transparent hover:bg-ifr-hover/50"
                  }`}
                  style={{
                    fontFamily: "var(--ifr-font-body)",
                    fontSize: "var(--ifr-fs-sm)",
                    color: "var(--ifr-text-primary)",
                  }}
                >
                  {t(filterLabels[opt])}
                </button>
              ))}
            </div>
          )}
        </div>

        {isOwner && (
          <Link href={ctaConfig.createUrl}>
            <a
              className="flex items-center gap-2 px-3 no-underline shrink-0 transition-colors hover:opacity-90"
              style={{
                height: "36px",
                borderRadius: "var(--ifr-radius-sm)",
                backgroundColor: "var(--ifr-yellow)",
                fontFamily: "var(--ifr-font-body)",
                fontSize: "var(--ifr-fs-sm)",
                fontWeight: "var(--ifr-fw-medium)",
                color: "var(--ifr-text-primary)",
              }}
            >
              <Add size={16} />
              {t("Create New DPP")}
            </a>
          </Link>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div
            className="animate-spin rounded-full border-2 border-ifr border-t-ifr-green"
            style={{ width: 32, height: 32 }}
          />
        </div>
      ) : filteredDpps.length === 0 ? (
        <div className="bg-ifr-surface border border-ifr rounded-ifr-md p-12 text-center">
          <p
            className="text-ifr-text-secondary"
            style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-md)" }}
          >
            {t("No DPPs yet")}
          </p>
        </div>
      ) : (
        <div className="bg-ifr-surface border border-ifr rounded-ifr-md overflow-hidden">
          {/* Table header */}
          <div
            className="grid gap-4 px-5 py-3 border-b border-ifr text-ifr-text-secondary"
            style={{
              gridTemplateColumns: "2fr 110px 1fr 90px 140px 70px 50px",
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-sm)",
              fontWeight: "var(--ifr-fw-semibold)",
            }}
          >
            <span>{t("Product ID")}</span>
            <span>{t("DPP ID")}</span>
            <span>{t("Batch / Unit")}</span>
            <span>{t("Status")}</span>
            <span>{t("Created")}</span>
            <span>{t("QR code")}</span>
            <span />
          </div>

          {/* Table rows */}
          {filteredDpps.map(dpp => {
            const productName =
              dpp.productOverview?.productName?.value || dpp.productOverview?.brandName?.value || t("Untitled DPP");
            const productId = dpp.productId || "—";
            const status = dpp.status || "draft";
            const colors = statusColors[status] || statusColors.draft;
            const dppUrl = `/dpps/${encodeURIComponent(dpp.id)}`;
            const dppDisplayId = dpp.id.length > 12 ? `${dpp.id.slice(0, 12)}…` : dpp.id;

            return (
              <div
                key={dpp.id}
                className="grid gap-4 px-5 py-4 border-b border-ifr last:border-b-0 hover:bg-ifr-hover/50 transition-colors items-center"
                style={{
                  gridTemplateColumns: "2fr 110px 1fr 90px 140px 70px 50px",
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-base)",
                }}
              >
                {/* Product ID + name */}
                <div className="flex flex-col min-w-0">
                  <span className="text-ifr-text-secondary truncate" style={{ fontSize: "var(--ifr-fs-sm)" }}>
                    {productId}
                  </span>
                  <Link href={dppUrl}>
                    <a
                      className="text-ifr-text-primary truncate no-underline hover:underline"
                      style={{ fontWeight: "var(--ifr-fw-medium)" }}
                    >
                      {productName}
                    </a>
                  </Link>
                </div>

                {/* DPP ID */}
                <span className="text-ifr-text-secondary truncate" title={dpp.id}>
                  {dppDisplayId}
                </span>

                {/* Batch / Unit */}
                <span className="text-ifr-text-secondary truncate">{dpp.batchId || "—"}</span>

                {/* Status */}
                <span>
                  <span
                    className="inline-block px-2 py-0.5"
                    style={{
                      borderRadius: "var(--ifr-radius-sm)",
                      backgroundColor: colors.bg,
                      color: colors.text,
                      fontSize: "var(--ifr-fs-sm)",
                      fontWeight: "var(--ifr-fw-medium)",
                    }}
                  >
                    {t(status.charAt(0).toUpperCase() + status.slice(1))}
                  </span>
                </span>

                {/* Created */}
                <span
                  className="flex items-center gap-1 text-ifr-text-secondary"
                  style={{ fontSize: "var(--ifr-fs-sm)" }}
                >
                  <Calendar size={14} className="shrink-0" />
                  {dpp.createdAt
                    ? new Date(dpp.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </span>

                {/* QR code download */}
                <a
                  href={dppApi.getQrCodeUrl(dpp.id, 256)}
                  download={`dpp-${dpp.id}-qr.png`}
                  title={t("Download QR code")}
                  onClick={e => e.stopPropagation()}
                  className="inline-flex items-center justify-center bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity no-underline"
                  style={{ width: 32, height: 32, color: "var(--ifr-text-secondary)" }}
                >
                  <Download size={18} />
                </a>

                {/* More actions */}
                <div className="relative">
                  <button
                    type="button"
                    title={t("More actions")}
                    onClick={e => {
                      e.stopPropagation();
                      setShowActionsMenu(showActionsMenu === dpp.id ? null : dpp.id);
                    }}
                    className="inline-flex items-center justify-center bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity"
                    style={{ width: 32, height: 32, color: "var(--ifr-text-secondary)" }}
                  >
                    <OverflowMenuVertical size={18} />
                  </button>
                  {showActionsMenu === dpp.id && (
                    <div
                      className="absolute right-0 top-full mt-1 bg-ifr-surface border border-ifr shadow-lg z-30"
                      style={{ borderRadius: "var(--ifr-radius-sm)", minWidth: "160px" }}
                    >
                      <Link href={dppUrl}>
                        <a
                          className="block w-full text-left px-4 py-2 no-underline hover:bg-ifr-hover/50 transition-colors"
                          style={{
                            fontFamily: "var(--ifr-font-body)",
                            fontSize: "var(--ifr-fs-sm)",
                            color: "var(--ifr-text-primary)",
                          }}
                        >
                          {t("View")}
                        </a>
                      </Link>
                      {isOwner && status === "draft" && (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleStatusChange(dpp.id, "active");
                          }}
                          className="w-full text-left px-4 py-2 border-none cursor-pointer bg-transparent hover:bg-ifr-hover/50 transition-colors"
                          style={{
                            fontFamily: "var(--ifr-font-body)",
                            fontSize: "var(--ifr-fs-sm)",
                            color: "var(--ifr-text-primary)",
                          }}
                        >
                          {t("Publish")}
                        </button>
                      )}
                      {isOwner && (status === "draft" || status === "active") && (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleStatusChange(dpp.id, "archived");
                          }}
                          className="w-full text-left px-4 py-2 border-none cursor-pointer bg-transparent hover:bg-ifr-hover/50 transition-colors"
                          style={{
                            fontFamily: "var(--ifr-font-body)",
                            fontSize: "var(--ifr-fs-sm)",
                            color: "var(--ifr-text-primary)",
                          }}
                        >
                          {t("Archive")}
                        </button>
                      )}
                      {isOwner && status === "archived" && (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleStatusChange(dpp.id, "draft");
                          }}
                          className="w-full text-left px-4 py-2 border-none cursor-pointer bg-transparent hover:bg-ifr-hover/50 transition-colors"
                          style={{
                            fontFamily: "var(--ifr-font-body)",
                            fontSize: "var(--ifr-fs-sm)",
                            color: "var(--ifr-text-primary)",
                          }}
                        >
                          {t("Restore to Draft")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination footer */}
          <div
            className="flex items-center justify-between px-5 py-3 border-t border-ifr"
            style={{
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-sm)",
              color: "var(--ifr-text-secondary)",
            }}
          >
            <span>
              {t("Showing {{count}} of {{total}} DPPs", {
                count: filteredDpps.length,
                total: total,
              })}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center bg-transparent border border-ifr cursor-not-allowed opacity-50"
                style={{ width: 32, height: 32, borderRadius: "var(--ifr-radius-sm)" }}
              >
                <ChevronLeft size={16} className="text-ifr-text-secondary" />
              </button>
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center bg-transparent border border-ifr cursor-not-allowed opacity-50"
                style={{ width: 32, height: 32, borderRadius: "var(--ifr-radius-sm)" }}
              >
                <ChevronRight size={16} className="text-ifr-text-secondary" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Community Tab ──────────────────────────────────────────────────────────

function CommunityTabContent() {
  const { t } = useTranslation("common");

  return (
    <div className="bg-ifr-surface border border-ifr rounded-ifr-md p-12 text-center">
      <p
        className="text-ifr-text-secondary"
        style={{
          fontFamily: "var(--ifr-font-body)",
          fontSize: "var(--ifr-fs-md)",
        }}
      >
        {t("Community features coming soon")}
      </p>
    </div>
  );
}

// ─── Main Profile Page ──────────────────────────────────────────────────────

export default function ProfilePageNew() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { person, id } = useUser();
  const { user } = useAuth();
  const { designId, productId, serviceId } = useFilters();

  const isOwner = user?.ulid === id;

  // Tab state from URL
  const tabParam = (router.query.tab as string) || "designs";
  const activeTab: ProfileTabId = (
    ["designs", "products", "services", "dpps", "community"].includes(tabParam) ? tabParam : "designs"
  ) as ProfileTabId;

  const setActiveTab = useCallback(
    (tab: ProfileTabId) => {
      router.push({ pathname: router.pathname, query: { ...router.query, tab } }, undefined, { shallow: true });
    },
    [router]
  );

  // Spec ID for filtering
  const specIdMap: Record<string, string | undefined> = {
    designs: designId,
    products: productId,
    services: serviceId,
  };

  return (
    <div className="flex-1 bg-ifr-page" style={{ fontFamily: "var(--ifr-font-body)" }}>
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="rounded-full overflow-hidden border border-ifr" style={{ width: "120px", height: "120px" }}>
              <BrUserAvatar userId={id} size="120px" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2 min-w-0">
                {/* Name + verified */}
                <div className="flex items-center gap-2">
                  <h1
                    className="text-ifr-text-primary m-0 truncate"
                    style={{
                      fontFamily: "var(--ifr-font-heading)",
                      fontSize: "var(--ifr-fs-2xl)",
                      fontWeight: "var(--ifr-fw-bold)",
                      lineHeight: "1.2",
                    }}
                  >
                    {isOwner ? `${t("Hi,")} ${person?.user || person?.name}` : person?.user || person?.name}
                  </h1>
                  {person?.isVerified && (
                    <span
                      className="text-white shrink-0 flex items-center gap-1 px-2"
                      style={{
                        height: "22px",
                        borderRadius: "var(--ifr-radius-sm)",
                        backgroundColor: "var(--ifr-green)",
                        fontFamily: "var(--ifr-font-body)",
                        fontSize: "var(--ifr-fs-sm)",
                        fontWeight: "var(--ifr-fw-medium)",
                      }}
                    >
                      {t("Verified")}
                    </span>
                  )}
                </div>

                {/* Subtitle (owner) */}
                {isOwner && (
                  <p
                    className="text-ifr-text-secondary m-0"
                    style={{
                      fontFamily: "var(--ifr-font-body)",
                      fontSize: "var(--ifr-fs-md)",
                      lineHeight: "1.5",
                    }}
                  >
                    {t("Manage and track all your project documentation")}
                  </p>
                )}

                {/* Bio */}
                {person?.note && (
                  <p
                    className="text-ifr-text-secondary m-0"
                    style={{
                      fontFamily: "var(--ifr-font-body)",
                      fontSize: "var(--ifr-fs-md)",
                      lineHeight: "1.5",
                    }}
                  >
                    {person.note}
                  </p>
                )}

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-4 mt-1">
                  {person?.primaryLocation?.name && (
                    <div className="flex items-center gap-1.5">
                      <LocationMarkerIcon className="w-4 h-4" style={{ color: "var(--ifr-green)" }} />
                      <span
                        className="text-ifr-text-secondary"
                        style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
                      >
                        {person.primaryLocation.name}
                      </span>
                    </div>
                  )}
                  {person?.email && (
                    <div className="flex items-center gap-1.5">
                      <ExternalLinkIcon className="w-4 h-4" style={{ color: "var(--ifr-green)" }} />
                      <span
                        className="text-ifr-text-secondary"
                        style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
                      >
                        {person.email}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {isOwner ? (
                  <Link href={`/profile/${id}/edit`}>
                    <a
                      className="flex items-center gap-1.5 px-4 no-underline text-white transition-opacity hover:opacity-90"
                      style={{
                        height: "var(--ifr-control-height)",
                        borderRadius: "var(--ifr-radius-sm)",
                        backgroundColor: "var(--ifr-green)",
                        fontFamily: "var(--ifr-font-body)",
                        fontSize: "var(--ifr-fs-base)",
                        fontWeight: "var(--ifr-fw-medium)",
                      }}
                    >
                      {t("Edit Profile")}
                    </a>
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-4 text-white border-none cursor-pointer transition-opacity hover:opacity-90"
                    style={{
                      height: "var(--ifr-control-height)",
                      borderRadius: "var(--ifr-radius-sm)",
                      backgroundColor: "var(--ifr-green)",
                      fontFamily: "var(--ifr-font-body)",
                      fontSize: "var(--ifr-fs-base)",
                      fontWeight: "var(--ifr-fw-medium)",
                    }}
                  >
                    {t("Contact")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-ifr-surface border border-ifr rounded-ifr-md p-1.5 flex gap-1 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 border-none cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === tab.id ? "bg-ifr-hover border border-ifr" : "bg-transparent hover:bg-ifr-hover/50"
              }`}
              style={{
                height: "36px",
                borderRadius: "var(--ifr-radius-sm)",
                fontFamily: "var(--ifr-font-body)",
                fontSize: "var(--ifr-fs-base)",
                fontWeight: activeTab === tab.id ? "var(--ifr-fw-semibold)" : "var(--ifr-fw-medium)",
                color: activeTab === tab.id ? "var(--ifr-text-primary)" : "var(--ifr-text-secondary)",
              }}
            >
              <EntityTypeIcon
                type={tab.type}
                size="small"
                fill={activeTab === tab.id ? "var(--ifr-green)" : "var(--ifr-text-secondary)"}
              />
              {t(tab.labelKey)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setActiveTab("community")}
            className={`flex items-center gap-2 px-4 border-none cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === "community" ? "bg-ifr-hover border border-ifr" : "bg-transparent hover:bg-ifr-hover/50"
            }`}
            style={{
              height: "36px",
              borderRadius: "var(--ifr-radius-sm)",
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-base)",
              fontWeight: activeTab === "community" ? "var(--ifr-fw-semibold)" : "var(--ifr-fw-medium)",
              color: activeTab === "community" ? "var(--ifr-text-primary)" : "var(--ifr-text-secondary)",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke={activeTab === "community" ? "var(--ifr-green)" : "var(--ifr-text-secondary)"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {t("Community")}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "community" ? (
          <CommunityTabContent />
        ) : activeTab === "dpps" ? (
          <DppsTabContent userId={id} isOwner={isOwner} ctaConfig={tabCtaConfig.dpps} />
        ) : (
          <ProfileTabContent
            userId={id}
            specId={specIdMap[activeTab]}
            tabType={tabs.find(t => t.id === activeTab)?.type || ProjectType.DESIGN}
            isOwner={isOwner}
            ctaConfig={tabCtaConfig[activeTab as Exclude<ProfileTabId, "community">]}
          />
        )}
      </div>
    </div>
  );
}
