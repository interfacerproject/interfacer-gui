import { gql, useQuery } from "@apollo/client";
import { AdjustmentsIcon } from "@heroicons/react/outline";
import cn from "classnames";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useEffect, useState } from "react";
import AssetsTableRow from "./AssetsTableRow";
import BrTable from "./brickroom/BrTable";
import Spinner from "./brickroom/Spinner";
import Filters from "./Filters";

const AssetsTable = ({
  filter,
  noPrimaryAccountableFilter = false,
  hideHeader = false,
  hidePagination = false,
}: {
  filter?: any;
  noPrimaryAccountableFilter?: boolean;
  hidePagination?: boolean;
  hideHeader?: boolean;
}) => {
  const { t } = useTranslation("lastUpdatedProps");
  const QUERY_ASSETS = gql`
    query ($first: Int, $after: ID, $last: Int, $before: ID, $filter: ProposalFilterParams) {
      proposals(first: $first, after: $after, before: $before, last: $last, filter: $filter) {
        pageInfo {
          startCursor
          endCursor
          hasPreviousPage
          hasNextPage
          totalCount
          pageLimit
        }
        edges {
          cursor
          node {
            id
            name
            created
            primaryIntents {
              resourceClassifiedAs
              action {
                id
              }
              hasPointInTime
              hasBeginning
              hasEnd
              resourceInventoriedAs {
                conformsTo {
                  name
                }
                classifiedAs
                primaryAccountable {
                  name
                  id
                }
                name
                id
                note
                metadata
                onhandQuantity {
                  hasUnit {
                    label
                  }
                }
                images {
                  hash
                  name
                  mimeType
                  bin
                }
              }
            }
            reciprocalIntents {
              resourceQuantity {
                hasNumericalValue
                hasUnit {
                  label
                  symbol
                }
              }
            }
          }
        }
      }
    }
  `;
  const { loading, data, fetchMore, refetch, variables } = useQuery(QUERY_ASSETS, {
    variables: { last: 10, filter: filter },
  });
  const updateQuery = (previousResult: any, { fetchMoreResult }: any) => {
    if (!fetchMoreResult) {
      return previousResult;
    }

    const previousEdges = previousResult.proposals.edges;
    const fetchMoreEdges = fetchMoreResult.proposals.edges;

    fetchMoreResult.proposals.edges = [...previousEdges, ...fetchMoreEdges];

    return { ...fetchMoreResult };
  };
  const getHasNextPage = data?.proposals.pageInfo.hasNextPage;
  const loadMore = () => {
    if (data && fetchMore) {
      const nextPage = getHasNextPage;
      const before = data.proposals.pageInfo.endCursor;
      if (nextPage && before !== null) {
        fetchMore({ updateQuery, variables: { before } });
      }
    }
  };
  const assets = data?.proposals.edges;
  const showEmptyState = assets?.length === 0;

  // Poll interval that works with pagination
  useEffect(() => {
    const intervalId = setInterval(() => {
      const total = data?.proposals.edges.length || 0;

      refetch({
        ...variables,
        last: total,
      });
    }, 10000);
    return () => clearInterval(intervalId);
  }, [...Object.values(variables!).flat(), data?.proposals.pageInfo.startCursor]);

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
          {!hideHeader && (
            <div className="flex items-center justify-between py-5">
              <h3>{t("Assets")}</h3>
              <button
                onClick={toggleFilter}
                className={cn(
                  "gap-2 text-white-700 font-normal normal-case rounded-[4px] border-1 btn btn-sm btn-outline border-white-600 bg-white-100 hover:text-accent hover:bg-white-100",
                  { "bg-accent text-white-100": showFilter }
                )}
              >
                <AdjustmentsIcon className="w-5 h-5" /> {t("Filter by")}
              </button>
            </div>
          )}
          <div className="flex flex-col flex-col-reverse md:space-x-2 md:flex-row">
            <div className="pt-5 grow md:pt-0">
              <BrTable headArray={t("table_head", { returnObjects: true })}>
                {assets?.map((e: any) => (
                  <AssetsTableRow asset={e} key={e.cursor} />
                ))}
              </BrTable>
              {showEmptyState ? (
                <div className="p-4 pt-6">
                  <h4>{t("Create a new asset")}</h4>
                  <p className="pt-2 pb-5 font-light text-white-700">{t("empty_state_assets")}</p>
                  <Link href="/create_asset">
                    <a className="btn btn-accent btn-md">{t("Create asset")}</a>
                  </Link>
                </div>
              ) : (
                !hidePagination && (
                  <div className="w-full pt-4 text-center">
                    <button className="text-center btn btn-primary" onClick={loadMore} disabled={!getHasNextPage}>
                      {t("Load more")}
                    </button>
                  </div>
                )
              )}
            </div>
            {showFilter && <Filters noPrimaryAccountableFilter={noPrimaryAccountableFilter} filter={filter} />}
          </div>
        </div>
      )}
    </>
  );
};

export default AssetsTable;
