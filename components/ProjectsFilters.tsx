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
import { Button, Card, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { getOptionValue } from "components/brickroom/utils/BrSelectUtils";
import SearchUsers from "./SearchUsers";
import SelectProjectType from "./SelectProjectType";
import SelectTags from "./SelectTags";
import BrUserDisplay from "./brickroom/BrUserDisplay";
import PCardWithAction from "./polaris/PCardWithAction";

//

export interface ProjectsFiltersProps {
  hidePrimaryAccountable?: boolean;
  hideConformsTo?: boolean;
  children?: React.ReactNode;
}

export const ProjectFilters = ["conformsTo", "tags", "primaryAccountable"] as const;
export type ProjectFilter = typeof ProjectFilters[number];

export type QueryFilters<T> = Record<ProjectFilter, T>;

//

export default function ProjectsFilters(props: ProjectsFiltersProps) {
  const { hidePrimaryAccountable = false, hideConformsTo = false, children } = props;

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
    <Card sectioned>
      <Stack vertical>
        {/* Heading */}
        <Text as="h2" variant="heading2xl">
          {t("filters") + ":"}
        </Text>
        {/* Filters */}
        {children}
        {!hideConformsTo && (
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
        )}

        <SelectTags
          label={t("Tags")}
          tags={queryFilters.tags}
          setTags={tags => {
            setQueryFilters({
              ...queryFilters,
              tags: tags.map(decodeURI),
            });
          }}
        />

        {!hidePrimaryAccountable && (
          <SearchUsers
            onSelect={c => {
              setQueryFilters({
                ...queryFilters,
                // @ts-ignore
                primaryAccountable: [...queryFilters.primaryAccountable, c.id],
              });
            }}
            excludeIDs={queryFilters.primaryAccountable}
          />
        )}
        {queryFilters.primaryAccountable.length && (
          <Stack vertical spacing="tight">
            <Text variant="bodyMd" as="p">
              {t("Selected contributors")}
            </Text>
            {queryFilters.primaryAccountable.map(contributorId => (
              <PCardWithAction
                key={contributorId}
                onClick={() => {
                  setQueryFilters({
                    ...queryFilters,
                    // @ts-ignore
                    primaryAccountable: queryFilters.primaryAccountable.filter(e => e !== contributorId),
                  });
                }}
              >
                <BrUserDisplay userId={contributorId} />
              </PCardWithAction>
            ))}
          </Stack>
        )}

        {/* Control buttons */}
        <div className="flex gap-2">
          <Button data-test="btn-reset" onClick={clearFilters} size="large" fullWidth>
            {t("reset")}
          </Button>
          <Button primary data-test="btn-apply" onClick={applyFilters} size="large" fullWidth>
            {t("apply")}
          </Button>
        </div>
      </Stack>
    </Card>
  );
}
