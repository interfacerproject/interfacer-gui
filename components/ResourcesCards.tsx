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

import { Card } from "@bbtgnn/polaris-interfacer";
import { EconomicResource, FetchInventoryQuery, EconomicResourceFilterParams } from "lib/types";
import { gql, useQuery } from "@apollo/client";
import CardsGroup from "./CardsGroup";
import useLoadMore from "../hooks/useLoadMore";
import { FETCH_RESOURCES } from "../lib/QueryAndMutation";

export interface ResourcesCardsProps {
  filter?: EconomicResourceFilterParams;
  hidePagination?: boolean;
  hidePrimaryAccountable?: boolean;
  hideHeader?: boolean;
  hideFilters?: boolean;
}

const ResourcesCards = (props: ResourcesCardsProps) => {
  const {
    filter = {},
    hideHeader = false,
    hidePagination = false,
    hidePrimaryAccountable = false,
    hideFilters = false,
  } = props;
  const dataQueryIdentifier = "economicResources";

  const { loading, data, error, fetchMore, variables, refetch } = useQuery<FetchInventoryQuery>(FETCH_RESOURCES, {
    variables: {
      last: 10,
      filter: filter,
    },
  });
  const { loadMore, showEmptyState, items, getHasNextPage } = useLoadMore({
    fetchMore,
    refetch,
    variables,
    data,
    dataQueryIdentifier,
  });

  const resources = items;

  return (
    <>
      <CardsGroup
        onLoadMore={loadMore}
        nextPage={!!getHasNextPage}
        loading={loading}
        header={hideHeader ? undefined : "Resources"}
        hidePagination={hidePagination}
        hidePrimaryAccountable={hidePrimaryAccountable}
        hideFilters={hideFilters}
      >
        {resources?.map((e: { node: EconomicResource }) => (
          <>
            <Card
              key={e.node.id}
              title={e.node.name}
              footerActionAlignment={"right"}
              sectioned
              primaryFooterAction={{
                id: "primaryFooterAction",
                content: "View",
                url: `/resource/${e.node.id}`,
              }}
              secondaryFooterActions={[
                {
                  id: "watch",
                  content: "Watch",
                  url: "/watch",
                },
                {
                  id: "share",
                  content: "Share",
                  url: "/share",
                },
                {
                  id: "Add to list",
                  content: "Add to list +",
                  url: "/add-to-list",
                },
              ]}
            >
              <img src={e.node.metadata?.image} className="w-20 h-20" alt={e.node.name} />
              <p className="w-64">{e.node.note}</p>
            </Card>
          </>
        ))}
      </CardsGroup>
    </>
  );
};

export default ResourcesCards;
