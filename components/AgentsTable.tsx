import cn from "classnames";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

// Request
import { useQuery } from "@apollo/client";
import { FETCH_AGENTS, FETCH_RESOURCES } from "lib/QueryAndMutation";
import { GetPeopleQuery, GetPeopleQueryVariables, EconomicResourceFilterParams } from "lib/types";

// Components
import { AdjustmentsIcon } from "@heroicons/react/outline";
import AssetsFilters from "./AssetsFilters";
import AssetsTableBase from "./AssetsTableBase";
import Spinner from "./brickroom/Spinner";
import useLoadMore from "../hooks/useLoadMore";
import SelectAssetType from "./SelectAssetType";
import { getOptionValue } from "./brickroom/utils/BrSelectUtils";
import SelectTags from "./SelectTags";
import SelectContributors from "./SelectContributors";
import AgentsTableBase from "./AgentsTableBase";

//

export interface AgentsTableProps {
  hideHeader?: boolean;
  hidePagination?: boolean;
  id?: string[];
  searchFilter?: React.ReactNode;
  searchTerm: string;
}

//

export default function AgentsTable(props: AgentsTableProps) {
  const { t } = useTranslation("lastUpdatedProps");
  const { hideHeader = false, hidePagination = false, searchTerm, searchFilter } = props;

  const { loading, data, fetchMore, refetch, variables } = useQuery(FETCH_AGENTS, {
    variables: { last: 10, userOrName: searchTerm || "" },
  });

  const dataQueryIdentifier = "agents";

  const { loadMore, showEmptyState, items, getHasNextPage } = useLoadMore({
    fetchMore,
    refetch,
    variables,
    data,
    dataQueryIdentifier,
  });

  const people = data?.agents?.edges;

  const [showFilter, setShowFilter] = useState(false);
  const toggleFilter = () => setShowFilter(!showFilter);

  return (
    <>
      {loading && (
        <div className="w-full">
          <Spinner />
        </div>
      )}
      {!loading && (
        <div className="flex flex-col">
          {/* Header */}
          <div
            className={cn("flex items-center py-5", { "justify-end": hideHeader }, { "justify-between": !hideHeader })}
          >
            {/* Left side */}
            {!hideHeader && <h3>{t("Assets")}</h3>}

            {/* Right side */}
            <button
              onClick={toggleFilter}
              className={cn(
                "gap-2 text-white-700 font-normal normal-case rounded-[4px] border-1 btn btn-sm btn-outline border-white-600 bg-white-100 hover:text-accent hover:bg-white-100",
                { "bg-accent text-white-100": showFilter },
                { "float-right": hideHeader }
              )}
            >
              <AdjustmentsIcon className="w-5 h-5" /> {t("Filter by")}
            </button>
          </div>
          {/* Table and filters */}
          <div className="flex flex-row flex-nowrap items-start space-x-8">
            {data && (
              <div className="grow">
                <AgentsTableBase data={data} onLoadMore={loadMore} hidePagination={hidePagination} />
              </div>
            )}
            {showFilter && (
              <div className="basis-96 sticky top-8">
                <div className="p-4 bg-white border rounded-lg shadow space-y-6">
                  <h4 className="text-xl font-bold capitalize">{t("filters")}:</h4>
                  <div className="space-y-4">{searchFilter}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
