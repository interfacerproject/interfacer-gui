// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { useTranslation } from "next-i18next";
import { ALL_CATEGORIES, CATEGORY_ACCENT, CATEGORY_LABEL_KEY, SearchCategory } from "./constants";
import SearchResultsGrid from "./SearchResultsGrid";
import type { CategoryResult } from "./useSearchQueries";

interface Props {
  byCategory: Record<SearchCategory, CategoryResult>;
  q: string;
  onOpenCategory: (c: SearchCategory) => void;
}

export default function SearchAllView({ byCategory, q, onOpenCategory }: Props) {
  const { t } = useTranslation("common");

  // Errored categories are kept so the grid can show its error + retry branch —
  // dropping them would make a failure look like an empty category.
  const sections = ALL_CATEGORIES.filter(c => {
    const { count, loading, error } = byCategory[c];
    return loading || !!error || (typeof count === "number" && count > 0);
  });

  if (!sections.length) return null; // parent renders the zero-results state

  return (
    <div className="flex flex-col gap-10">
      {sections.map(category => {
        const result = byCategory[category];
        return (
          <section key={category}>
            <div className="flex items-center gap-2 mb-4">
              <span
                aria-hidden="true"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: CATEGORY_ACCENT[category],
                  display: "inline-block",
                }}
              />
              <h2
                className="text-ifr-text-primary"
                style={{
                  fontFamily: "var(--ifr-font-heading)",
                  fontSize: "var(--ifr-fs-lg)",
                  fontWeight: "var(--ifr-fw-bold)",
                }}
              >
                {t(CATEGORY_LABEL_KEY[category])}
              </h2>
              {typeof result.count === "number" && (
                <span
                  className="text-ifr-text-secondary"
                  style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
                >
                  {result.count}
                </span>
              )}
              <button
                type="button"
                onClick={() => onOpenCategory(category)}
                className="ml-auto text-ifr-green hover:underline"
                style={{
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-base)",
                  fontWeight: "var(--ifr-fw-medium)",
                }}
              >
                {`${t("Show all")} ›`}
              </button>
            </div>
            <SearchResultsGrid category={category} result={result} q={q} limit={6} showCount={false} />
          </section>
        );
      })}
    </div>
  );
}
