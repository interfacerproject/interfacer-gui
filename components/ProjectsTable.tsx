import cn from "classnames";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

// Request
import { useQuery } from "@apollo/client";
import { FETCH_RESOURCES } from "lib/QueryAndMutation";
import { EconomicResourceFilterParams, FetchInventoryQuery, FetchInventoryQueryVariables } from "lib/types";

// Components
import { AdjustmentsIcon } from "@heroicons/react/outline";
import ProjectsFilters from "./ProjectsFilters";
import ProjectsTableBase from "./ProjectsTableBase";
import Spinner from "./brickroom/Spinner";
import useLoadMore from "../hooks/useLoadMore";

//

export interface ProjectsTableProps {
  filter?: EconomicResourceFilterParams;
  hideHeader?: boolean;
  hidePagination?: boolean;
  hidePrimaryAccountable?: boolean;
  id?: string[];
  searchFilter?: React.ReactNode;
  hideFilters?: boolean;
}

//

export default function ProjectsTable(props: ProjectsTableProps) {
  const { t } = useTranslation("lastUpdatedProps");
  const {
    filter = {},
    hideHeader = false,
    hidePagination = false,
    hidePrimaryAccountable = false,
    searchFilter,
    hideFilters = false,
  } = props;

  const { loading, data, fetchMore, refetch, variables } = useQuery<FetchInventoryQuery, FetchInventoryQueryVariables>(
    FETCH_RESOURCES,
    {
      variables: { last: 10, filter: filter },
    }
  );

  const dataQueryIdentifier = "economicResources";

  const { loadMore, items, showEmptyState, getHasNextPage } = useLoadMore({
    fetchMore,
    refetch,
    variables,
    data,
    dataQueryIdentifier,
  });

  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    const showFiltersAtRender = !!filter.conformsTo || !!filter.primaryAccountable || !!filter.classifiedAs;
    setShowFilter(showFiltersAtRender);
  }, [filter]);

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
            {!hideHeader && <h3>{t("Projects")}</h3>}

            {/* Right side */}
            {!hideFilters && (
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
            )}
          </div>
          {/* Table and filters */}
          <div className="flex flex-row flex-nowrap items-start space-x-8">
            {data && (
              <div className="grow">
                <ProjectsTableBase
                  projects={items}
                  onLoadMore={loadMore}
                  hidePagination={hidePagination}
                  showEmptyState={showEmptyState}
                  hasNextPage={getHasNextPage}
                />
              </div>
            )}
            {showFilter && !hideFilters && (
              <div className="basis-96 sticky top-8">
                <ProjectsFilters hidePrimaryAccountable={hidePrimaryAccountable}>{searchFilter}</ProjectsFilters>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
