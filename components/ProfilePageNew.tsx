// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { useQuery } from "@apollo/client";
import { Add, ArrowRight, Search, SortAscending } from "@carbon/icons-react";
import { ExternalLinkIcon, LocationMarkerIcon } from "@heroicons/react/outline";
import BrUserAvatar from "components/brickroom/BrUserAvatar";
import EntityTypeIcon from "components/EntityTypeIcon";
import { useUser } from "components/layout/FetchUserLayout";
import ProjectCardNew from "components/ProjectCardNew";
import { ProjectType } from "components/types";
import { useAuth } from "hooks/useAuth";
import useFilters from "hooks/useFilters";
import useLoadMore from "hooks/useLoadMore";
import { FETCH_RESOURCES } from "lib/QueryAndMutation";
import { FetchInventoryQuery } from "lib/types";
import useDppApi from "lib/dpp";
import type { DppDocument, DppStatus, ListDppsResponse } from "lib/dpp-types";
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
    ctaTitle: "Create Digital Product Passports",
    ctaDescription:
      "Document the lifecycle, materials, and sustainability information of your products. Help consumers and regulators access transparent product data.",
    createLabel: "Create a new DPP",
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
  const [sortBy, setSortBy] = useState("latest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    dppApi
      .listDpps({ createdBy: userId, limit: 50 })
      .then((res: ListDppsResponse) => {
        if (!cancelled) {
          setDpps(res.dpps || []);
          setTotal(res.total || 0);
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

  const filteredDpps = useMemo(() => {
    let items = dpps;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        d =>
          d.batchId?.toLowerCase().includes(q) ||
          d.status?.toLowerCase().includes(q) ||
          d.batchType?.toLowerCase().includes(q) ||
          d.productOverview?.productName?.value?.toLowerCase().includes(q) ||
          d.productOverview?.brandName?.value?.toLowerCase().includes(q)
      );
    }
    if (sortBy === "oldest") items = [...items].reverse();
    return items;
  }, [dpps, searchQuery, sortBy]);

  const statusColors: Record<string, { bg: string; text: string }> = {
    active: { bg: "var(--ifr-green)", text: "#fff" },
    draft: { bg: "var(--ifr-gray, #6C707C)", text: "#fff" },
    archived: { bg: "var(--ifr-yellow)", text: "var(--ifr-text-primary)" },
  };

  return (
    <div className="flex flex-col gap-5">
      {/* CTA + Stats row (owner only) */}
      {isOwner && (
        <div className="flex flex-col md:flex-row gap-6 py-6">
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
        <div className="flex-1 flex items-center gap-3">
          <Search size={18} className="text-ifr-text-secondary shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t(ctaConfig.searchPlaceholder)}
            className="flex-1 bg-transparent border-none outline-none text-ifr-text-primary"
            style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)" }}
          />
        </div>

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
              gridTemplateColumns: "2fr 1fr 100px 100px 140px",
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-sm)",
              fontWeight: "var(--ifr-fw-semibold)",
            }}
          >
            <span>{t("Product")}</span>
            <span>{t("Batch / Serial")}</span>
            <span>{t("Type")}</span>
            <span>{t("Status")}</span>
            <span>{t("Created")}</span>
          </div>

          {/* Table rows */}
          {filteredDpps.map(dpp => {
            const productName =
              dpp.productOverview?.productName?.value || dpp.productOverview?.brandName?.value || t("Untitled DPP");
            const status = dpp.status || "draft";
            const colors = statusColors[status] || statusColors.draft;

            return (
              <div
                key={dpp.id}
                className="grid gap-4 px-5 py-4 border-b border-ifr last:border-b-0 hover:bg-ifr-hover/50 transition-colors items-center"
                style={{
                  gridTemplateColumns: "2fr 1fr 100px 100px 140px",
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-base)",
                }}
              >
                <span className="text-ifr-text-primary truncate" style={{ fontWeight: "var(--ifr-fw-medium)" }}>
                  {productName}
                </span>
                <span className="text-ifr-text-secondary truncate">{dpp.batchId || "—"}</span>
                <span>
                  <span
                    className="inline-block px-2 py-0.5 text-ifr-text-secondary"
                    style={{
                      borderRadius: "var(--ifr-radius-sm)",
                      border: "1px solid var(--ifr-border)",
                      fontSize: "var(--ifr-fs-sm)",
                    }}
                  >
                    {dpp.batchType === "unit" ? t("Unit") : t("Batch")}
                  </span>
                </span>
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
                <span className="text-ifr-text-secondary" style={{ fontSize: "var(--ifr-fs-sm)" }}>
                  {dpp.createdAt ? new Date(dpp.createdAt).toLocaleDateString() : "—"}
                </span>
              </div>
            );
          })}
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
