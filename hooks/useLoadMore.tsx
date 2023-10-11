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

import { useTranslation } from "next-i18next";
import { ReactNode, useEffect } from "react";

export interface PaginationProps {
  children: React.ReactNode;
  onLoadMore: () => void;
  nextPage: boolean;
}

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
  const { t } = useTranslation("lastUpdatedProps");

  const WithPagination = ({ children }: { children: ReactNode }) => (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{children}</div>
      <div className="w-full pt-4 text-center">
        <button className="text-center btn btn-primary" onClick={loadMore} disabled={!getHasNextPage}>
          {t("Load more")}
        </button>
      </div>
    </div>
  );

  // Poll interval that works with pagination
  useEffect(() => {
    const intervalId = setInterval(async () => {
      const total = data?.[dataQueryIdentifier].edges.length || 0;
      await refetch({
        ...variables,
        last: total,
      });
    }, 10000);
    return () => clearInterval(intervalId);
  }, [data, dataQueryIdentifier, variables]);

  return { loadMore, showEmptyState, items, getHasNextPage, WithPagination };
};

export default useLoadMore;
