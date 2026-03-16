// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { useQuery } from "@apollo/client";
import { Search } from "@carbon/icons-react";
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
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useMemo, useState } from "react";

// ─── Tab definitions ────────────────────────────────────────────────────────

type ProfileTabId = "designs" | "products" | "services" | "community";

interface TabDef {
  id: ProfileTabId;
  labelKey: string;
  type: ProjectType;
}

const tabs: TabDef[] = [
  { id: "designs", labelKey: "Designs", type: ProjectType.DESIGN },
  { id: "products", labelKey: "Products", type: ProjectType.PRODUCT },
  { id: "services", labelKey: "Services", type: ProjectType.SERVICE },
];

// ─── Profile Tab Content ────────────────────────────────────────────────────

function ProfileTabContent({ userId, specId, tabType }: { userId: string; specId?: string; tabType: ProjectType }) {
  const { t } = useTranslation("common");
  const [searchQuery, setSearchQuery] = useState("");

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
      {/* Search & Sort */}
      <div
        className="bg-ifr-surface border border-ifr rounded-ifr-md flex items-center gap-3 px-4"
        style={{ height: "var(--ifr-control-height)" }}
      >
        <Search size={18} className="text-ifr-text-secondary shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={t("Search...")}
          className="flex-1 bg-transparent border-none outline-none text-ifr-text-primary"
          style={{
            fontFamily: "var(--ifr-font-body)",
            fontSize: "var(--ifr-fs-base)",
          }}
        />
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
    ["designs", "products", "services", "community"].includes(tabParam) ? tabParam : "designs"
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
        ) : (
          <ProfileTabContent
            userId={id}
            specId={specIdMap[activeTab]}
            tabType={tabs.find(t => t.id === activeTab)?.type || ProjectType.DESIGN}
          />
        )}
      </div>
    </div>
  );
}
