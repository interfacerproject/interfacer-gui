// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { Close, LocationStar, Tag } from "@carbon/icons-react";
import { AdjustmentsIcon } from "@heroicons/react/outline";
import FilterSection from "components/FilterSection";
import ToggleSwitch from "components/ToggleSwitch";
import { PRODUCT_CATEGORY_OPTIONS, TAG_PREFIX, slugifyTagValue } from "lib/tagging";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import LocationFilterSection from "./LocationFilterSection";

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  asDrawer: boolean;
}

export default function SearchFilterPanel({ collapsed, onToggle, asDrawer }: Props) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const drawerOpen = asDrawer && !collapsed;

  // While the drawer covers the results, scrolling belongs to the drawer.
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onToggle();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen, onToggle]);

  const descOn = router.query.desc !== "0";

  const currentTags = useMemo(() => {
    const raw = router.query.tags;
    if (!raw) return [] as string[];
    return typeof raw === "string" ? raw.split(",") : (raw as string[]);
  }, [router.query.tags]);

  const setParam = (key: string, value: string | null) => {
    const query = { ...router.query };
    if (value === null) delete query[key];
    else query[key] = value;
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  const toggleCategoryTag = (cat: string) => {
    const encoded = `${TAG_PREFIX.CATEGORY}-${slugifyTagValue(cat)}`;
    const next = currentTags.includes(encoded) ? currentTags.filter(x => x !== encoded) : [...currentTags, encoded];
    setParam("tags", next.length ? next.join(",") : null);
  };

  const selectedCategories = useMemo<string[]>(() => {
    const set = new Set(currentTags);
    return (PRODUCT_CATEGORY_OPTIONS as readonly string[]).filter(c =>
      set.has(`${TAG_PREFIX.CATEGORY}-${slugifyTagValue(c)}`)
    );
  }, [currentTags]);

  const hasActiveFilters = currentTags.length > 0 || !descOn || !!router.query.nearLat;

  const resetAll = () => {
    const query = { ...router.query };
    ["tags", "desc", "nearLat", "nearLong", "nearDistanceKm", "locationLabel"].forEach(k => delete query[k]);
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  const sections = (
    <>
      <FilterSection icon={<AdjustmentsIcon className="w-4 h-4" />} label={t("Search scope")} defaultOpen>
        <ToggleSwitch
          label={t("Also search descriptions")}
          checked={descOn}
          onChange={checked => setParam("desc", checked ? null : "0")}
        />
      </FilterSection>

      <FilterSection icon={<LocationStar size={16} />} label={t("Location")} defaultOpen>
        <LocationFilterSection />
      </FilterSection>

      <FilterSection icon={<Tag size={16} />} label={t("Categories & tags")}>
        <div className="flex flex-col gap-2 max-h-[216px] overflow-y-auto pr-3">
          {PRODUCT_CATEGORY_OPTIONS.map((cat: string) => {
            const active = selectedCategories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategoryTag(cat)}
                className={`text-left px-3 py-2 rounded-ifr-sm transition-colors cursor-pointer ${
                  active ? "bg-ifr-active text-ifr-green font-medium" : "hover:bg-ifr-search text-ifr-text-secondary"
                }`}
                style={{
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-base)",
                  fontWeight: "var(--ifr-fw-medium)",
                }}
              >
                {active ? "✓ " : "+ "}
                {t(cat)}
              </button>
            );
          })}
        </div>
      </FilterSection>
    </>
  );

  // Shared by both presentations — the panel content never changes, only its frame.
  const header = (
    <div className="border-b border-ifr px-6 py-4 flex items-center justify-between gap-3 shrink-0">
      <p
        className="text-ifr-text-primary"
        style={{
          fontFamily: "var(--ifr-font-body)",
          fontSize: "var(--ifr-fs-md)",
          fontWeight: "var(--ifr-fw-regular)",
        }}
      >
        {t("Filter by")}
      </p>
      <div className="flex items-center gap-3">
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetAll}
            className="text-ifr-text-secondary hover:text-ifr-text-primary text-ifr-sm underline transition-colors cursor-pointer"
            style={{
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-sm)",
              fontWeight: "var(--ifr-fw-medium)",
            }}
          >
            {t("Reset")}
          </button>
        )}
        {asDrawer && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={t("Close filters")}
            className="flex items-center justify-center -mr-2 text-ifr-text-secondary hover:text-ifr-text-primary transition-colors cursor-pointer bg-transparent border-none"
            style={{ width: "var(--ifr-control-height)", height: "var(--ifr-control-height)" }}
          >
            <Close size={20} />
          </button>
        )}
      </div>
    </div>
  );

  if (asDrawer) {
    return (
      <>
        {drawerOpen && (
          <div className="fixed inset-0 z-[60] bg-[var(--ifr-overlay-dark)]" onClick={onToggle} aria-hidden="true" />
        )}
        <aside
          className="fixed top-0 left-0 bottom-0 z-[70] bg-ifr-surface flex flex-col"
          style={{
            width: "min(var(--ifr-sidebar-width), calc(100vw - 40px))",
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
            transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 250ms ease",
            boxShadow: drawerOpen ? "var(--ifr-shadow-dropdown)" : "none",
            overscrollBehavior: "contain",
          }}
          aria-hidden={!drawerOpen}
        >
          {header}
          <div className="flex-1 overflow-y-auto">{sections}</div>
        </aside>
      </>
    );
  }

  return (
    <div
      className="bg-ifr-surface border-r border-ifr shrink-0 relative sticky self-start"
      style={{
        width: collapsed ? "0px" : "var(--ifr-sidebar-width)",
        overflow: "hidden",
        transition: "width 250ms ease",
        borderRightWidth: collapsed ? "0px" : undefined,
        top: "var(--ifr-topbar-height)",
        maxHeight: "calc(100vh - var(--ifr-topbar-height))",
      }}
    >
      <div
        className="overflow-y-auto"
        style={{
          width: "var(--ifr-sidebar-width)",
          maxHeight: "calc(100vh - var(--ifr-topbar-height))",
          opacity: collapsed ? 0 : 1,
          transition: "opacity 200ms ease",
          pointerEvents: collapsed ? "none" : undefined,
        }}
      >
        {header}

        {sections}
      </div>
    </div>
  );
}
