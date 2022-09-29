import React, { useEffect, useState } from "react";
import Link from "next/link";
import BrTable from "./brickroom/BrTable";
import BrTags from "./brickroom/BrTags";
import BrDisplayUser from "./brickroom/BrDisplayUser";
import AssetImage from "./AssetImage";
import AssetsTableRow from "./AssetsTableRow";
import { useTranslation } from "next-i18next";
import { gql, useQuery } from "@apollo/client";
import devLog from "../lib/devLog";

const AssetsTable = ({ userid }: { userid?: string }) => {
    const { t } = useTranslation("lastUpdatedProps");
    const QUERY_ASSETS = gql`
        query ($first: Int, $after: ID, $last: Int, $before: ID) {
            proposals(
                first: $first
                after: $after
                before: $before
                last: $last
            ) {
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
                                primaryAccountable {
                                    name
                                    id
                                }
                                name
                                id
                                note
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
    const queryResult = useQuery(QUERY_ASSETS, { variables: { last: 10 } });
    const updateQuery = (previousResult: any, { fetchMoreResult }: any) => {
        if (!fetchMoreResult) {
            return previousResult;
        }

        const previousEdges = previousResult.proposals.edges;
        const fetchMoreEdges = fetchMoreResult.proposals.edges;

        fetchMoreResult.proposals.edges = [...previousEdges, ...fetchMoreEdges];

        return { ...fetchMoreResult };
    };
    const getHasNextPage = queryResult.data?.proposals.pageInfo.hasNextPage;
    const loadMore = () => {
        if (queryResult.data && queryResult.fetchMore) {
            const nextPage = getHasNextPage;
            const before = queryResult.data.proposals.pageInfo.endCursor;

            if (nextPage && before !== null) {
                queryResult.fetchMore({ updateQuery, variables: { before } });
            }
        }
    };
    const assets = userid
        ? queryResult.data?.proposals.edges.filter(
              (edge: any) =>
                  edge.node.primaryIntents[0]?.resourceInventoriedAs
                      .primaryAccountable.id === userid
          )
        : queryResult.data?.proposals.edges;
    // Poll interval that works with pagination
    useEffect(() => {
        if (!userid) {
            const intervalId = setInterval(() => {
                const total = queryResult.data?.proposals.edges.length || 0;

                queryResult?.refetch({
                    ...queryResult.variables,
                    last: total,
                });
            }, 10000);

            return () => clearInterval(intervalId);
        }
    }, [
        ...Object.values(queryResult.variables!).flat(),
        queryResult.data?.proposals.pageInfo.startCursor,
    ]);
    devLog(queryResult.data);

    return (
        <>
            {/* Table */}
            <BrTable headArray={t("tableHead", { returnObjects: true })}>
                {assets?.map((e: any) => (
                    <AssetsTableRow asset={e} key={e.cursor} />
                ))}
            </BrTable>

            {/* Load more button */}
            <div className="grid grid-cols-1 gap-4 mt-4 place-items-center">
                <button
                    className="btn btn-primary"
                    onClick={loadMore}
                    disabled={!getHasNextPage}
                >
                    {t("Load more")}
                </button>
            </div>
        </>
    );
};

export default AssetsTable;
