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

import { useQuery } from "@apollo/client";
import { Text } from "@bbtgnn/polaris-interfacer";
import useLoadMore from "../hooks/useLoadMore";
import devLog from "../lib/devLog";
import { FETCH_RESOURCES } from "../lib/QueryAndMutation";
import { EconomicResource, EconomicResourceFilterParams } from "../lib/types";
import BrTags from "./brickroom/BrTags";
import CardsGroup from "./CardsGroup";
import ProjectContributors from "./ProjectContributors";
import ProjectImage from "./ProjectImage";
import ProjectTime from "./ProjectTime";
import ProjectTypeChip from "./ProjectTypeChip";

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
        header={hideHeader ? undefined : "Latest projects"}
        hidePagination={hidePagination}
      >
        {projects?.map(({ node }: { node: EconomicResource }) => (
          <div className="p-4 rounded-lg overflow-hidden bg-white border border-" key={node.id}>
            <div className="flex flex-col space-y-3">
              <ProjectTime projectNode={node} />
              <ProjectImage image={node?.images?.[0]} className="rounded-lg" />
              <Text variant="headingXl" as="h4">
                {node.name}
              </Text>
              <ProjectTypeChip projectNode={node} />
              <BrTags tags={node.classifiedAs || []} />
              <ProjectContributors projectNode={node} />
            </div>
          </div>
        ))}
      </CardsGroup>
    </>
  );
};

export default ProjectsCards;
