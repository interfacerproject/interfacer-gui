import { gql, useQuery } from "@apollo/client";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useEffect } from "react";
import devLog from "../lib/devLog";
import BrLoadMore from "./brickroom/BrLoadMore";
import BrTable from "./brickroom/BrTable";
import Spinner from "./brickroom/Spinner";

const truncate = (input: string, max: number) => (input?.length > max ? `${input.substring(0, max)}...` : input);

// prettier-ignore
const FETCH_INVENTORY = gql`
  query ($first: Int, $after: ID, $last: Int, $before: ID, $filter: EconomicResourceFilterParams) {
    economicResources(first: $first after: $after before: $before last: $last filter: $filter) {
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
          conformsTo {
            id
            name
          }
          currentLocation {
            id
            name
            mappableAddress
          }
          id
          name
          note
          metadata
          okhv
          repo
          version
          licensor
          license
          primaryAccountable {
            id
            name
            note
          }
          custodian {
            id
            name
            note
          }
          accountingQuantity {
            hasUnit {
              id
              label
              symbol
            }
            hasNumericalValue
          }
          onhandQuantity {
            hasUnit {
              id
              label
              symbol
            }
            hasNumericalValue
          }
        }
      }
    }
  }
`;

const ResourceTable = ({ filter }: { filter?: any }) => {
  const { t } = useTranslation("resourcesProps");

  devLog("filter", filter);
  const { loading, data, error, fetchMore, variables, refetch } = useQuery(FETCH_INVENTORY, {
    variables: {
      last: 10,
      filter: filter,
    },
  });
  devLog(error);
  devLog("loading", loading);
  !loading && devLog(data);

  const updateQuery = (previousResult: any, { fetchMoreResult }: any) => {
    if (!fetchMoreResult) {
      return previousResult;
    }
    const previousEdges = previousResult.economicResources.edges;
    const fetchMoreEdges = fetchMoreResult.economicResources.edges;
    fetchMoreResult.economicResources.edges = [...previousEdges, ...fetchMoreEdges];
    return { ...fetchMoreResult };
  };

  const getHasNextPage = data?.economicResources.pageInfo.hasNextPage;

  const loadMore = () => {
    if (data && fetchMore) {
      const nextPage = getHasNextPage;
      const before = data.economicResources.pageInfo.endCursor;

      if (nextPage && before !== null) {
        // @ts-ignore
        fetchMore({ updateQuery, variables: { before } });
      }
    }
  };

  //this is to refetch the data
  useEffect(() => {
    const intervalId = setInterval(() => {
      const total = data?.economicResources.edges.length || 0;

      refetch({
        ...variables,
        last: total,
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [...Object.values(variables!).flat(), data?.economicResources.pageInfo.startCursor]);

  return (
    <>
      {data ? (
        <>
          <BrTable headArray={t("resourceHead", { returnObjects: true })}>
            {data?.economicResources.edges.length !== 0 && (
              <>
                {data?.economicResources.edges.map((e: any) => (
                  <div className="table-row" key={e.node.id} data-test="resource-item">
                    {/* Cell 1 */}
                    <div className="table-cell">
                      <Link href={`/resource/${e.node.id}`}>
                        <a className="flex items-center space-x-4">
                          <img src={e.node.metadata?.image} className="w-20 h-20" />
                          <div className="flex flex-col h-24 space-y-1 w-60">
                            <h4 className="truncate w-60">{e.node.name}</h4>
                            <p className="h-16 overflow-hidden text-sm whitespace-normal text-thin">
                              {truncate(e.node.note, 100)}
                            </p>
                          </div>
                        </a>
                      </Link>
                    </div>

                    {/* Cell 2 */}
                    <div className="table-cell align-top">
                      <span className="font-semibold">{e.node.metadata?.__meta?.source || ""}</span>
                      <br />
                      <Link href={e.node?.repo || ""}>
                        <a className="text-sm" target="_blank">
                          {truncate(e.node.repo || "", 40)}
                        </a>
                      </Link>
                    </div>

                    {/* Cell 3 */}
                    <div className="table-cell align-top">
                      <div className="whitespace-normal">
                        <p>
                          <span className="font-semibold">{e.node.license}</span>
                          <br />
                          <span className="italic">
                            {t("by")} {e.node.licensor}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Cell 4 */}
                    <div className="table-cell text-sm align-top">
                      Version: {e.node.version}
                      <br />
                      {e.node.okhv}
                    </div>
                  </div>
                ))}
              </>
            )}
            {data?.economicResources.edges.length === 0 && (
              <>
                <div className="table-row">
                  <div className="table-cell col-span-full">
                    <h4>There’s nothing to display here.</h4>
                    <p>
                      This table will display the resources that you will have in inventory. Raise, transfer or Produce
                      a resource and it will displayed here.
                    </p>
                  </div>
                </div>
              </>
            )}
          </BrTable>
          <BrLoadMore handleClick={loadMore} disabled={!getHasNextPage} text={"Load more"} />
        </>
      ) : (
        <Spinner />
      )}
    </>
  );
};

export default ResourceTable;
