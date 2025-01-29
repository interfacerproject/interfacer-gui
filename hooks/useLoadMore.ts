// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
      const total = data?.[dataQueryIdentifier].edges.length || variables.last;
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
