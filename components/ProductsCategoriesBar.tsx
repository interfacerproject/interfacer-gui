// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { prefixedTag, PRODUCT_CATEGORY_OPTIONS, TAG_PREFIX } from "lib/tagging";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

type QueryValue = string | string[] | undefined;

function asCsvArray(value: QueryValue): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(v => v.split(",").filter(Boolean));
  return value.split(",").filter(Boolean);
}

const FIXED_CATEGORIES = PRODUCT_CATEGORY_OPTIONS;

export default function ProductsCategoriesBar() {
  const { t } = useTranslation("productsProps");
  const router = useRouter();

  const rawTags = asCsvArray(router.query.tags);

  const selected = new Set(rawTags.filter(tag => tag.startsWith(`${TAG_PREFIX.CATEGORY}-`)));

  const toggleCategory = (label: (typeof FIXED_CATEGORIES)[number]) => {
    const tag = prefixedTag(TAG_PREFIX.CATEGORY, label);
    if (!tag) return;

    const nextTags = selected.has(tag) ? rawTags.filter(t => t !== tag) : [...rawTags, tag];

    const nextQuery: Record<string, any> = { ...router.query };
    if (nextTags.length > 0) nextQuery.tags = nextTags.join(",");
    else delete nextQuery.tags;

    router.push({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
  };

  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-2">
        {FIXED_CATEGORIES.map(label => {
          const tag = prefixedTag(TAG_PREFIX.CATEGORY, label);
          const isSelected = Boolean(tag && selected.has(tag));

          return (
            <button
              key={label}
              type="button"
              onClick={() => toggleCategory(label)}
              className={
                "px-3 py-1.5 rounded-full text-sm border transition-colors " +
                (isSelected
                  ? "bg-[#036A53] text-white border-[#036A53]"
                  : "bg-white text-gray-700 border-[#C9CCCF] hover:bg-gray-50")
              }
              style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
            >
              {t(label)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
