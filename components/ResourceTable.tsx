import { gql, useQuery } from "@apollo/client";
import { FetchInventoryQuery, FetchInventoryQueryVariables } from "lib/types";
import { useTranslation } from "next-i18next";
import BrTable from "./brickroom/BrTable";
import Spinner from "./brickroom/Spinner";
import ResourceTableRow from "./ResourceTableRow";

// prettier-ignore
const FETCH_INVENTORY = gql`query FetchInventory($first: Int, $after: ID, $last: Int, $before: ID, $filter: EconomicResourceFilterParams) {
  economicResources(
    first: $first
    after: $after
    before: $before
    last: $last
    filter: $filter
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
}`;

//

export interface ResourceTableProps extends FetchInventoryQueryVariables {}

//

export default function ResourceTable(props: ResourceTableProps) {
  // Loading translations
  const { t } = useTranslation("resourcesProps");

  // Fetching data
  const { loading, data, error, fetchMore, refetch } = useQuery<FetchInventoryQuery, FetchInventoryQueryVariables>(
    FETCH_INVENTORY,
    { variables: props }
  );

  // Checking if data has length, in order to display it
  const dataLength = data?.economicResources?.edges.length;

  // Pagination - Getting next page of results, if it exists
  const hasNextPage = data?.economicResources?.pageInfo.hasNextPage;
  // Getting last id as cursor
  const before = data?.economicResources?.pageInfo.endCursor;

  // const updateQuery = (
  //   previousResult: FetchInventoryQuery,
  //   { fetchMoreResult }: { fetchMoreResult: FetchInventoryQuery }
  // ) => {
  //   if (!fetchMoreResult) {
  //     return previousResult;
  //   }
  //   if (fetchMoreResult && fetchMoreResult.economicResources) {
  //     const previousEdges = previousResult?.economicResources?.edges;
  //     const fetchMoreEdges = fetchMoreResult?.economicResources?.edges;
  //     if (previousEdges && fetchMoreEdges) {
  //       fetchMoreResult.economicResources.edges = [...previousEdges, ...fetchMoreEdges];
  //       return { ...fetchMoreResult };
  //     }
  //   }
  // };

  // const loadMore = () => {
  //   if (data && fetchMore && hasNextPage && before) {
  //     // fetchMore({ updateQuery, variables: { before } });
  //     fetchMore({
  //       variables: {
  //       offset: data.economicResources.
  //     }});
  //   }
  // };

  //this is to refetch the data
  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     const total = data?.economicResources?.edges.length || 0;

  //     refetch({
  //       ...variables,
  //       last: total,
  //     });
  //   }, 5000);

  //   return () => clearInterval(intervalId);
  // }, [...Object.values(variables!).flat(), data?.economicResources?.pageInfo.startCursor]);

  // Displaying loading
  if (loading) {
    return (
      <div className="flex flex-row justify-center items-center p-4 bg-white">
        <Spinner />
      </div>
    );
  }

  // Displaying error
  if (error) {
    return <pre className="text-red-600 bg-red-200 p-4 rounded-md">{error.message}</pre>;
  }

  // Otherwise, displaying table
  return (
    <>
      <BrTable headArray={t("resourceHead", { returnObjects: true })}>
        {/* If there's data, show the rows */}
        {data && dataLength && (
          <>
            {data.economicResources?.edges.map(e => (
              <ResourceTableRow edge={e} key={e.node.id} />
            ))}
          </>
        )}

        {/* Otherwise, we show empty state */}
        {!dataLength && (
          <div className="table-row">
            <div className="table-cell col-span-full p-4">
              <h4>There’s nothing to display here.</h4>
              <p>
                This table will display the resources that you will have in inventory. Raise, transfer or Produce a
                resource and it will displayed here.
              </p>
            </div>
          </div>
        )}
      </BrTable>
      {/* <button className="">Load more</button>
      <BrLoadMore handleClick={loadMore} disabled={!getHasNextPage} text={"Load more"} /> */}
    </>
  );
}
