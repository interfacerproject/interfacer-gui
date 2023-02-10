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
import { EconomicResource, EconomicResourceFilterParams } from "../lib/types";
import { useQuery } from "@apollo/client";
import { FETCH_RESOURCES } from "../lib/QueryAndMutation";
import CardsGroup from "./CardsGroup";
import useLoadMore from "../hooks/useLoadMore";
import devLog from "../lib/devLog";

export interface ProjectsCardsProps {
  filter?: EconomicResourceFilterParams;
  hidePagination?: boolean;
  hidePrimaryAccountable?: boolean;
  hideHeader?: boolean;
  hideFilters?: boolean;
}

const ProjectsCards = (props: ProjectsCardsProps) => {
  const {
    filter = {},
    hideHeader = false,
    hidePagination = false,
    hidePrimaryAccountable = false,
    hideFilters = false,
  } = props;
  const dataQueryIdentifier = "economicResources";

  const { loading, data, fetchMore, refetch, variables } = useQuery<{ data: EconomicResource }>(FETCH_RESOURCES, {
    variables: { last: 10, filter: filter },
  });
  const { loadMore, showEmptyState, items, getHasNextPage } = useLoadMore({
    fetchMore,
    refetch,
    variables,
    data,
    dataQueryIdentifier,
  });

  const projects = items;

  devLog("projects", projects);

  return (
    <>
      <CardsGroup
        onLoadMore={loadMore}
        nextPage={!!getHasNextPage}
        loading={loading}
        header={hideHeader ? undefined : "Projects"}
        hidePagination={hidePagination}
        hidePrimaryAccountable={hidePrimaryAccountable}
        hideFilters={hideFilters}
      >
        {projects?.map(({ node }: { node: EconomicResource }) => (
          <>
            <Card
              key={node.id}
              title={node.name}
              footerActionAlignment={"right"}
              sectioned
              primaryFooterAction={{
                id: "primaryFooterAction",
                content: "View",
                url: `/project/${node.id}`,
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
              <p className="w-64">{node.note}</p>
            </Card>
          </>
        ))}
      </CardsGroup>
    </>
  );
};

export default ProjectsCards;
