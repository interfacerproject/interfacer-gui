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

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useState } from "react";

// Select components
import { getOptionValue } from "components/brickroom/utils/BrSelectUtils";
import SelectProjectType from "./SelectProjectType";
import SelectContributors from "./SelectContributors";
import SelectTags from "./SelectTags";
import devLog from "../lib/devLog";

//

export interface ProjectsFiltersProps {
  hidePrimaryAccountable?: boolean;
  children?: React.ReactNode;
}

export const ProjectFilters = ["conformsTo", "tags", "primaryAccountable"] as const;
export type ProjectFilter = typeof ProjectFilters[number];

export type QueryFilters<T> = Record<ProjectFilter, T>;

//

export default function ProjectsFilters(props: ProjectsFiltersProps) {
  const { hidePrimaryAccountable = false, children } = props;

  const { t } = useTranslation("lastUpdatedProps");
  const router = useRouter();

  /* Filters */

  // Getting query values
  const query = router.query as QueryFilters<string>;

  // Converts query value in string array
  function getFilterValues(filter: ProjectFilter): Array<string> {
    if (!query[filter]) return [];
    else return query[filter].split(",");
  }

  // Creating state and loading it them with existing values
  const [queryFilters, setQueryFilters] = useState<QueryFilters<Array<string>>>(() => {
    return {
      conformsTo: getFilterValues("conformsTo"),
      tags: getFilterValues("tags"),
      primaryAccountable: getFilterValues("primaryAccountable"),
    };
  });

  /* Filters logic */

  function applyFilters() {
    for (let f of ProjectFilters) {
      if (queryFilters[f].length > 0) query[f] = queryFilters[f].join(",");
      else delete query[f];
    }

    router.push({
      pathname: router.pathname,
      query,
    });
  }

  function clearFilters() {
    setQueryFilters({
      conformsTo: [],
      tags: [],
      primaryAccountable: [],
    });

    router.replace({
      pathname: router.pathname,
      query: {},
    });
  }

  /* */

  return (
    <div className="p-4 bg-white border rounded-lg shadow space-y-6">
      {/* Heading */}
      <h4 className="text-xl font-bold capitalize">{t("filters")}:</h4>

      {/* Filters */}
      <div className="space-y-4">
        {children}

        <SelectProjectType
          label={t("Type")}
          onChange={v => {
            setQueryFilters({
              ...queryFilters,
              // @ts-ignore
              conformsTo: v.map(getOptionValue),
            });
          }}
          isMulti
          defaultValueRaw={queryFilters.conformsTo}
          id="type"
        />

        <SelectTags
          label={t("Tags")}
          onChange={v => {
            setQueryFilters({
              ...queryFilters,
              // @ts-ignore
              tags: v.map(getOptionValue),
            });
          }}
          isMulti
          defaultValueRaw={queryFilters.tags}
          id="tags"
        />

        {!hidePrimaryAccountable && (
          <SelectContributors
            label={t("Contributors")}
            onChange={v => {
              setQueryFilters({
                ...queryFilters,
                // @ts-ignore
                primaryAccountable: v.map(e => e.value.id),
              });
            }}
            isMulti
            defaultValueRaw={queryFilters.primaryAccountable}
            id="primaryAccountable"
          />
        )}
      </div>

      {/* Control buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button data-test="btn-reset" className="btn btn-outline btn-error btn-block" onClick={clearFilters}>
          {t("reset")}
        </button>
        <button data-test="btn-apply" onClick={applyFilters} className="btn btn-accent btn-block">
          {t("apply")}
        </button>
      </div>
    </div>
  );
}
