import { useEffect } from "react";

const useLoadMore = ({
  dataQueryIdentifier,
  data,
  fetchMore,
  refetch,
  variables,
}: {
  dataQueryIdentifier: string;
  data: any;
  fetchMore: Function;
  refetch: Function;
  variables: any;
}) => {
  const updateQuery = (previousResult: any, { fetchMoreResult }: any) => {
    if (!fetchMoreResult) {
      return previousResult;
    }

    const previousEdges = previousResult[dataQueryIdentifier].edges;
    const fetchMoreEdges = fetchMoreResult[dataQueryIdentifier].edges;

    fetchMoreResult[dataQueryIdentifier].edges = [...previousEdges, ...fetchMoreEdges];

    return { ...fetchMoreResult };
  };

  const getHasNextPage = data?.[dataQueryIdentifier].pageInfo.hasNextPage;
  const loadMore = () => {
    if (data && fetchMore) {
      const nextPage = getHasNextPage;
      const before = data[dataQueryIdentifier].pageInfo.endCursor;
      if (nextPage && before !== null) {
        fetchMore({ updateQuery, variables: { before } });
      }
    }
  };
  const items = data?.[dataQueryIdentifier].edges;
  const showEmptyState = items?.length === 0;

  const startCursor = data?.[dataQueryIdentifier].pageInfo.startCursor;
  // Poll interval that works with pagination
  useEffect(() => {
    const intervalId = setInterval(() => {
      const total = data?.[dataQueryIdentifier].edges.length || 0;

      refetch({
        ...variables,
        last: total,
      });
    }, 10000);
    return () => clearInterval(intervalId);
  }, [...Object.values(variables!).flat(), startCursor]);
  return { loadMore, showEmptyState, items, getHasNextPage };
};

export default useLoadMore;
