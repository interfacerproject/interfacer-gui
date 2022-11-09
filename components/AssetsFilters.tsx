import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useState } from "react";

// Select components
import { getOptionValue } from "components/brickroom/utils/BrSelectUtils";
import SelectAssetType from "./SelectAssetType";
import SelectContributors from "./SelectContributors";
import SelectTags from "./SelectTags";

//

export interface AssetsFiltersProps {
  hidePrimaryAccountable?: boolean;
}

export const AssetFilters = ["conformsTo", "tags", "primaryAccountable"] as const;
export type AssetFilter = typeof AssetFilters[number];

export type QueryFilters<T> = Record<AssetFilter, T>;

//

export default function AssetsFilters(props: AssetsFiltersProps) {
  const { hidePrimaryAccountable = false } = props;

  const { t } = useTranslation("lastUpdatedProps");
  const router = useRouter();

  /* Filters */

  // Getting query values
  const query = router.query as QueryFilters<string>;

  // Converts query value in string array
  function getFilterValues(filter: AssetFilter): Array<string> {
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
    for (let f of AssetFilters) {
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
      <h4 className="text-xl font-bold">{t("filters.filter for")}:</h4>

      {/* Filters */}
      <div className="space-y-4">
        <SelectAssetType
          label={t("filters.type")}
          onChange={v => {
            setQueryFilters({
              ...queryFilters,
              // @ts-ignore
              conformsTo: v.map(getOptionValue),
            });
          }}
          isMulti
          defaultValueRaw={queryFilters.conformsTo}
          testID="type"
        />

        <SelectTags
          label={t("filters.tags")}
          onChange={v => {
            setQueryFilters({
              ...queryFilters,
              // @ts-ignore
              tags: v.map(getOptionValue),
            });
          }}
          isMulti
          defaultValueRaw={queryFilters.tags}
          testID="tags"
        />

        {!hidePrimaryAccountable && (
          <SelectContributors
            label={t("filters.contributors")}
            onChange={v => {
              setQueryFilters({
                ...queryFilters,
                // @ts-ignore
                primaryAccountable: v.map(getOptionValue),
              });
            }}
            isMulti
            defaultValueRaw={queryFilters.primaryAccountable}
            testID="primaryAccountable"
          />
        )}
      </div>

      {/* Control buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button data-test="btn-reset" className="btn btn-outline btn-error btn-block" onClick={clearFilters}>
          {t("filters.reset")}
        </button>
        <button data-test="btn-apply" onClick={applyFilters} className="btn btn-accent btn-block">
          {t("filters.apply")}
        </button>
      </div>
    </div>
  );
}
