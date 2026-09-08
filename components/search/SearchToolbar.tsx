// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { AdjustmentsIcon, SearchIcon } from "@heroicons/react/outline";
import ToolbarDropdown from "components/ToolbarDropdown";
import { useTranslation } from "next-i18next";
import React, { useEffect, useState } from "react";

interface Props {
  q: string;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  sort: string;
  onSortChange: (v: string) => void;
  view: "list" | "map";
  onViewChange: (v: "list" | "map") => void;
  showViewToggle: boolean;
  /** Hidden where the ordering has no effect: the People query and the map view. */
  showSort: boolean;
  onSubmitQuery: (next: string) => void;
}

const SORT_OPTIONS = ["Relevance", "A–Z", "Z–A"];

export default function SearchToolbar(props: Props) {
  const { t } = useTranslation("common");
  const [value, setValue] = useState(props.q);
  useEffect(() => setValue(props.q), [props.q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    props.onSubmitQuery(value.trim());
  };

  return (
    <div className="bg-ifr-surface border-b border-ifr px-4 md:px-6 py-4 md:py-5">
      <div className="flex flex-wrap items-center justify-between gap-3 md:gap-6">
        <button
          type="button"
          onClick={props.onToggleSidebar}
          className={`order-1 flex items-center gap-[8px] px-3 shrink-0 border transition-colors cursor-pointer ${
            !props.sidebarCollapsed
              ? "bg-ifr-hover border-ifr text-ifr-text-primary"
              : "bg-ifr-surface border-transparent text-ifr-text-secondary hover:border-ifr hover:text-ifr-text-primary"
          }`}
          style={{ height: "var(--ifr-control-height)", borderRadius: "var(--ifr-radius-sm)" }}
          aria-label={props.sidebarCollapsed ? t("Show filters") : t("Hide filters")}
        >
          <AdjustmentsIcon className="w-4 h-4" />
          <span
            style={{
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-base)",
              fontWeight: "var(--ifr-fw-medium)",
              lineHeight: "21px",
            }}
          >
            {t("Filters")}
          </span>
        </button>

        <form onSubmit={submit} className="order-3 md:order-2 w-full md:w-auto md:flex-1 max-w-[845px] relative">
          <label className="sr-only" htmlFor="search-refine">
            {t("Search")}
          </label>
          <div className="bg-ifr-search border border-ifr rounded-full px-4 py-2.5 md:py-3 flex items-center gap-3">
            <SearchIcon className="w-5 h-5 shrink-0 text-ifr-text-secondary" />
            <input
              id="search-refine"
              type="search"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={t("Search designs, products, services, machines, people…")}
              className="flex-1 min-w-0 bg-transparent text-ifr-text-primary placeholder:text-ifr-text-muted outline-none"
              style={{ fontFamily: "var(--ifr-font-body)", lineHeight: "21px" }}
            />
          </div>
        </form>

        <div className="order-2 md:order-3 flex items-center gap-3 shrink-0">
          {props.showViewToggle && (
            <div
              role="radiogroup"
              aria-label={t("Results view")}
              className="flex border border-ifr rounded-ifr-sm overflow-hidden"
            >
              {(["list", "map"] as const).map(v => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={props.view === v}
                  onClick={() => props.onViewChange(v)}
                  className="px-3 py-2 text-[13px]"
                  style={{
                    fontFamily: "var(--ifr-font-body)",
                    background: props.view === v ? "var(--ifr-text-primary)" : "transparent",
                    color: props.view === v ? "#fff" : "var(--ifr-text-secondary)",
                  }}
                >
                  {v === "list" ? t("List") : t("Map")}
                </button>
              ))}
            </div>
          )}
          {props.showSort && (
            <ToolbarDropdown
              label={t("Sort by")}
              value={props.sort}
              options={SORT_OPTIONS}
              onChange={props.onSortChange}
              getOptionLabel={o => t(o)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
