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
import { Spinner } from "@bbtgnn/polaris-interfacer";
import { DraftProject } from "lib/db";
import Link from "next/link";
import useLoadMore from "../hooks/useLoadMore";
import { FETCH_RESOURCES } from "../lib/QueryAndMutation";
import { EconomicResource, EconomicResourceFilterParams } from "../lib/types";
import DraftCard from "./DraftCard";
import EmptyState from "./EmptyState";
import LoshCard from "./LoshCard";
import ProjectCard from "./ProjectCard";
import ProjectDisplay from "./ProjectDisplay";
import WithFilterLayout from "./layout/WithFilterLayout";

export enum CardType {
  PROJECT = "project",
  DRAFT = "draft",
  TINY = "tiny",
}

export interface ProjectsCardsProps {
  filter?: EconomicResourceFilterParams;
  hidePagination?: boolean;
  hidePrimaryAccountable?: boolean;
  hideHeader?: boolean;
  hideFilters?: boolean;
  header?: string;
  tiny?: boolean;
  type?: CardType;
  drafts?: DraftProject[];
  emptyState?: React.ReactElement;
}

const ProjectsCards = (props: ProjectsCardsProps) => {
  const {
    filter = {},
    hideHeader = false,
    hidePagination = false,
    hideFilters = false,
    type = CardType.PROJECT,
    tiny = false,
    header = "Latest projects",
    drafts,
    emptyState = <EmptyState heading="No projects found" />,
  } = props;
  const dataQueryIdentifier = "economicResources";

  const { loading, data, fetchMore, refetch, variables } = useQuery<{ data: EconomicResource }>(FETCH_RESOURCES, {
    variables: { last: 12, filter: filter },
  });
  const { showEmptyState, items, WithPagination } = useLoadMore({
    fetchMore,
    refetch,
    variables,
    data,
    dataQueryIdentifier,
  });
  const projects = items;

  if (showEmptyState || !projects || !projects.length) return emptyState;

  const distinguishProjects = (project: EconomicResource) => {
    const isLosh = project.primaryAccountable.id === process.env.NEXT_PUBLIC_LOSH_ID;
    return !isLosh ? (
      <ProjectCard project={project} key={project.id} />
    ) : (
      <LoshCard project={project} key={project.id} />
    );
  };

  if (type === CardType.DRAFT && !drafts) return <EmptyState heading="No drafts found" />;

  const FiltersWrapper = ({ children }: { children: React.ReactNode }) =>
    !hideFilters ? (
      <WithFilterLayout header={hideHeader ? undefined : header} length={projects?.length || 0}>
        {children}
      </WithFilterLayout>
    ) : (
      <>{children}</>
    );

  const PaginationWrapper = ({ children }: { children: React.ReactNode }) =>
    !hidePagination ? <WithPagination>{children}</WithPagination> : <>{children}</>;

  if (loading)
    return (
      <div className="w-full mt-10">
        <Spinner />
      </div>
    );

  return (
    <>
      {type === CardType.PROJECT && !tiny && (
        <FiltersWrapper>
          <PaginationWrapper>
            {projects?.map(({ node }: { node: EconomicResource }) => distinguishProjects(node))}
          </PaginationWrapper>
        </FiltersWrapper>
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
      {type === CardType.DRAFT && !tiny && drafts && (
        <FiltersWrapper>
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {drafts?.map(d => (
                <DraftCard project={d.project} projectType={d.type} id={d.id} key={d.id} />
              ))}
            </div>
          </div>
        </FiltersWrapper>
      )}
    </>
  );
};

export default ProjectsCards;
