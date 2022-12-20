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

//

export interface ProjectsTableProps {
  filter?: EconomicResourceFilterParams;
  hideHeader?: boolean;
  hidePagination?: boolean;
  hidePrimaryAccountable?: boolean;
  id?: string[];
  searchFilter?: React.ReactNode;
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
  } = props;

  const { loading, data, fetchMore, refetch, variables } = useQuery<FetchInventoryQuery, FetchInventoryQueryVariables>(
    FETCH_RESOURCES,
    {
      variables: { last: 10, filter: filter },
    }
  );

  const updateQuery = (previousResult: any, { fetchMoreResult }: any) => {
    if (!fetchMoreResult) {
      return previousResult;
    }

    const previousEdges = previousResult.economicResources.edges;
    const fetchMoreEdges = fetchMoreResult.economicResources.edges;

    fetchMoreResult.economicResources.edges = [...previousEdges, ...fetchMoreEdges];

    return { ...fetchMoreResult };
  };

  const getHasNextPage = data?.economicResources?.pageInfo.hasNextPage;
  const loadMore = () => {
    if (data && fetchMore) {
      const nextPage = getHasNextPage;
      const before = data.economicResources?.pageInfo.endCursor;
      if (nextPage && before !== null) {
        fetchMore({ updateQuery, variables: { before } });
      }
    }
  };
  const projects = data?.economicResources?.edges;
  const showEmptyState = projects?.length === 0;

  // Poll interval that works with pagination
  useEffect(() => {
    const intervalId = setInterval(() => {
      const total = data?.economicResources?.edges.length || 0;

      refetch({
        ...variables,
        last: total,
      });
    }, 120000);
    return () => clearInterval(intervalId);
  }, [...Object.values(variables!).flat(), data?.economicResources?.pageInfo.startCursor]);

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
            {!hideHeader && <h3>{t("Projects")}</h3>}

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
                <ProjectsTableBase data={data} onLoadMore={loadMore} hidePagination={hidePagination} />
              </div>
            )}
            {showFilter && (
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
