import React, { useEffect } from "react";
import BrTable from "./brickroom/BrTable";
import AssetsTableRow from "./AssetsTableRow";
import { useTranslation } from "next-i18next";
import { gql, useQuery } from "@apollo/client";
import devLog from "../lib/devLog";
import Filters from "./Filters";
import Spinner from "./brickroom/Spinner";

const AssetsTable = ({filter, noPrimaryAccountableFilter = false}: { filter?: any, noPrimaryAccountableFilter?: boolean}) => {
    const {t} = useTranslation('lastUpdatedProps')
    const QUERY_ASSETS = gql`query ($first: Int, $after: ID, $last: Int, $before: ID, $filter:ProposalFilterParams) {
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
            primaryAccountable{
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
`
    const {loading, data, fetchMore, refetch, variables} = useQuery(QUERY_ASSETS, {variables: {last: 10, filter: filter}})
    const updateQuery = (previousResult: any, {fetchMoreResult}: any) => {
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
    }, [
        ...Object.values(variables!).flat(),
        data?.proposals.pageInfo.startCursor,
    ]);

    devLog(data)

    return (<div className="grid grid-cols-1 gap-2 md:grid-cols-8">
        {loading && <div className="col-span-8"><Spinner/></div>}
        {!loading &&<><div className="col-span-6">
            <BrTable headArray={t('tableHead', {returnObjects: true})}>
                {assets?.map((e: any) =>
                  <AssetsTableRow asset={e} key={e.cursor} />
                )}
            </BrTable>
            <div className="grid grid-cols-1 gap-4 mt-4 place-items-center">
                <button className="btn btn-primary" onClick={loadMore}
                        disabled={!getHasNextPage}>{t('Load more')}</button>
            </div>
        </div>
        <div className="col-span-2">
            <Filters noPrimaryAccountableFilter={noPrimaryAccountableFilter}/>
        </div></>}
    </div>)
}

export default AssetsTable;
