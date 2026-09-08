// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { useTranslation } from "next-i18next";
import { ALL_CATEGORIES, CATEGORY_ACCENT, CATEGORY_LABEL_KEY, SearchCategory } from "./constants";

type TabId = "all" | SearchCategory;

interface Props {
  active: TabId;
  counts: Record<SearchCategory, number | null>;
  onSelect: (c: TabId) => void;
}

export default function SearchCategoryTabs({ active, counts, onSelect }: Props) {
  const { t } = useTranslation("common");
  const resolved = ALL_CATEGORIES.every(c => typeof counts[c] === "number");
  const allCount = resolved ? ALL_CATEGORIES.reduce((a, c) => a + (counts[c] as number), 0) : null;

  const tabs: Array<{ id: TabId; label: string; accent: string; count: number | null }> = [
    { id: "all", label: t("All"), accent: "var(--ifr-yellow)", count: allCount },
    ...ALL_CATEGORIES.map(c => ({
      id: c as TabId,
      label: t(CATEGORY_LABEL_KEY[c]),
      accent: CATEGORY_ACCENT[c],
      count: counts[c],
    })),
  ];

  return (
    <div
      role="tablist"
      aria-label={t("Result categories")}
      className="flex gap-1 px-4 md:px-6 overflow-x-auto border-b"
      style={{ background: "#03302c", borderColor: "rgba(255,255,255,0.12)" }}
    >
      {tabs.map(tab => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={selected}
            type="button"
            onClick={() => onSelect(tab.id)}
            className="flex items-center gap-2 whitespace-nowrap py-3 px-3.5 text-[13px] border-b-2 transition-colors"
            style={{
              color: selected ? "#fff" : "rgba(255,255,255,0.72)",
              borderColor: selected ? "var(--ifr-yellow)" : "transparent",
              fontFamily: "var(--ifr-font-body)",
            }}
          >
            <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 2, background: tab.accent }} />
            {tab.label}
            {typeof tab.count === "number" && (
              <span
                aria-label={t("{{n}} results", { n: tab.count })}
                style={{ fontSize: 11, padding: "1px 6px", borderRadius: 999, background: "rgba(255,255,255,0.14)" }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
