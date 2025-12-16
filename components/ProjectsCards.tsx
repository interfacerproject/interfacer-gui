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
import { DraftProject } from "lib/db";
import React from "react";
import useLoadMore from "../hooks/useLoadMore";
import { useProjectSpecs } from "../hooks/useProjectSpecs";
import { FETCH_RESOURCES } from "../lib/QueryAndMutation";
import { EconomicResource, EconomicResourceFilterParams } from "../lib/types";
// import CardsGroup from "./CardsGroup";
// import DraftCard from "./DraftCard";
import Link from "next/link";
import EmptyState from "./EmptyState";
import LoshCard from "./LoshCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
// import ProjectDisplay from "./ProjectDisplay";
import dynamic from "next/dynamic";
import ProjectCardFigma from "./ProjectCardFigma";
import { useTranslation } from "next-i18next";

const ProjectDisplay = dynamic(() => import("./ProjectDisplay"), { ssr: false });
const CardsGroup = dynamic(() => import("./CardsGroup"), { ssr: false });
const DraftCard = dynamic(() => import("./DraftCard"), { ssr: false });

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
  onDataLoaded?: (data: { totalCount: number; loading: boolean }) => void;
}

const ProjectsCards = (props: ProjectsCardsProps) => {
  const { t } = useTranslation("components");
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
    onDataLoaded,
  } = props;
  const dataQueryIdentifier = "economicResources";
  const { projectSpecIds } = useProjectSpecs();

  // Only show actual projects (DESIGN, SERVICE, PRODUCT, MACHINE) - exclude DPP and machine resources
  const filterWithProjectTypes: EconomicResourceFilterParams = {
    ...filter,
    conformsTo: filter.conformsTo || projectSpecIds,
  };

  const { loading, data, fetchMore, refetch, variables, error } = useQuery<{ data: EconomicResource }>(
    FETCH_RESOURCES,
    {
      variables: { last: 12, filter: filterWithProjectTypes },
      skip: projectSpecIds.length === 0,
    }
  );
  const { loadMore, showEmptyState, items, getHasNextPage } = useLoadMore({
    fetchMore,
    refetch,
    variables,
    data,
    dataQueryIdentifier,
  });
  const projects = items;

  // Notify parent of data changes
  React.useEffect(() => {
    if (onDataLoaded && data?.economicResources?.pageInfo) {
      onDataLoaded({
        totalCount: data.economicResources.pageInfo.totalCount || 0,
        loading,
      });
    }
  }, [data, loading, onDataLoaded]);

  // Show skeleton loaders during initial load
  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Show error state with retry
  if (error) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t("Error loading projects")}</h3>
        <p className="text-sm text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#036A53] hover:bg-[#025845] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#036A53]"
        >
          {t("Try Again")}
        </button>
      </div>
    );
  }

  if (showEmptyState || !projects || !projects.length) return emptyState;

  const distinguishProjects = (project: EconomicResource) => {
    const isLosh = project.primaryAccountable.id === process.env.NEXT_PUBLIC_LOSH_ID;
    return !isLosh ? (
      <ProjectCardFigma project={project} key={project.id} />
    ) : (
      <LoshCard project={project} key={project.id} />
    );
  };

  if (type === CardType.DRAFT && !drafts) return <EmptyState heading="No drafts found" />;

  return (
    <>
      {type === CardType.PROJECT && !tiny && (
        <CardsGroup
          onLoadMore={loadMore}
          nextPage={!!getHasNextPage}
          loading={loading}
          header={hideHeader ? undefined : header}
          hidePagination={hidePagination}
          length={projects?.length || 0}
          hideFilters={hideFilters}
        >
          {projects?.map(({ node }: { node: EconomicResource }) => distinguishProjects(node))}
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
      {type === CardType.DRAFT && !tiny && drafts && (
        <CardsGroup
          onLoadMore={loadMore}
          nextPage={false}
          loading={false}
          header={hideHeader ? undefined : header}
          hidePagination={hidePagination}
          length={drafts?.length || 0}
          hideFilters
        >
          {drafts?.map(d => (
            <DraftCard project={d.project} projectType={d.type} id={d.id} key={d.id} />
          ))}
        </CardsGroup>
      )}
    </>
  );
};

export default ProjectsCards;
