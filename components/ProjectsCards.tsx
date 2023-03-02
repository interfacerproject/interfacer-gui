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
import { useAuth } from "hooks/useAuth";
import Link from "next/link";
import useLoadMore from "../hooks/useLoadMore";
import { FETCH_RESOURCES } from "../lib/QueryAndMutation";
import { EconomicResource, EconomicResourceFilterParams } from "../lib/types";
import AddStar from "./AddStar";
import BrDisplayUser from "./brickroom/BrDisplayUser";
import BrTags from "./brickroom/BrTags";
import CardsGroup from "./CardsGroup";
import ProjectContributors from "./ProjectContributors";
import ProjectDisplay from "./ProjectDisplay";
import ProjectImage from "./ProjectImage";
import ProjectTime from "./ProjectTime";
import ProjectTypeChip from "./ProjectTypeChip";
import { ProjectType } from "./types";

export interface ProjectsCardsProps {
  filter?: EconomicResourceFilterParams;
  hidePagination?: boolean;
  hidePrimaryAccountable?: boolean;
  hideHeader?: boolean;
  hideFilters?: boolean;
  header?: string;
  tiny?: boolean;
}

const ProjectsCards = (props: ProjectsCardsProps) => {
  const {
    filter = {},
    hideHeader = false,
    hidePagination = false,
    hidePrimaryAccountable = false,
    hideFilters = false,
    tiny = false,
    header = "Latest projects",
  } = props;
  const dataQueryIdentifier = "economicResources";
  const { user } = useAuth();

  const { loading, data, fetchMore, refetch, variables } = useQuery<{ data: EconomicResource }>(FETCH_RESOURCES, {
    variables: { last: 6, filter: filter },
  });
  const { loadMore, showEmptyState, items, getHasNextPage } = useLoadMore({
    fetchMore,
    refetch,
    variables,
    data,
    dataQueryIdentifier,
  });

  const projects = items;

  return (
    <>
      {!tiny && (
        <CardsGroup
          onLoadMore={loadMore}
          nextPage={!!getHasNextPage}
          loading={loading}
          header={hideHeader ? undefined : header}
          hidePagination={hidePagination}
          length={projects?.length || 0}
          hideFilters={hideFilters}
        >
          {projects?.map(({ node }: { node: EconomicResource }) => (
            <div className="p-4 rounded-lg overflow-hidden bg-white shadow mx-2 lg:mx-0 " key={node.id}>
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between">
                  <ProjectTime projectNode={node} />
                  {user && <AddStar id={node.id} owner={node.primaryAccountable.id} tiny />}
                </div>
                <Link href={`/project/${node.id}`}>
                  <a>
                    <ProjectImage
                      projectType={node.conformsTo.name as ProjectType}
                      image={node?.images?.[0]}
                      className="rounded-lg object-scale-down max-h-60 w-full"
                    />
                  </a>
                </Link>
                <Link href={`/project/${node.id}`}>
                  <a>
                    <Text variant="headingXl" as="h4">
                      {node.name}
                    </Text>
                  </a>
                </Link>
                <div className="flex justify-between">
                  <ProjectTypeChip projectNode={node} />
                  <BrDisplayUser id={node.primaryAccountable.id} name={node.primaryAccountable.name} />
                </div>
                <BrTags tags={node.classifiedAs || []} />
                <ProjectContributors projectNode={node} />
              </div>
            </div>
          ))}
        </CardsGroup>
      )}
      {tiny &&
        projects?.map(({ node }: { node: EconomicResource }) => (
          <div className="py-2 hover:bg-base-300" key={node.id}>
            <Link href={`/project/${node.id}`}>
              <a>
                <ProjectDisplay project={node} />
              </a>
            </Link>
          </div>
        ))}
    </>
  );
};

export default ProjectsCards;
