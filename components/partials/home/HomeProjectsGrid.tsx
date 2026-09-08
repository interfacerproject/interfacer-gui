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

/**
 * A fixed-size row of project cards for the homepage.
 *
 * `CatalogLayout` is the catalogue-page component: it brings its own hero,
 * filter sidebar, search bar and "load more" pagination. The homepage shows a
 * plain teaser row of N cards followed by a single link, so it queries directly
 * and reuses the exact same card the catalogues render (`ProjectCardNew`).
 */

import ProductCardSkeleton from "components/ProductCardSkeleton";
import ProjectCardNew from "components/ProjectCardNew";
import { useQuery } from "lib/apollo-compat";
import { FETCH_RESOURCES } from "lib/QueryAndMutation";
import { EconomicResource, FetchInventoryQuery } from "lib/types";

export interface HomeProjectsGridProps {
  /** ResourceSpecification id the cards must conform to (design, product, …). */
  conformsTo?: string;
  /** How many cards to show once loaded. */
  count: number;
  /** Tailwind grid-template classes, so each section can set its own columns. */
  className: string;
}

export default function HomeProjectsGrid({ conformsTo, count, className }: HomeProjectsGridProps) {
  const { data, loading } = useQuery<FetchInventoryQuery>(FETCH_RESOURCES, {
    variables: {
      last: count,
      filter: {
        conformsTo: conformsTo ? [conformsTo] : undefined,
        notCustodian: [process.env.NEXT_PUBLIC_LOSH_ID!],
      },
    },
    skip: !conformsTo,
  });

  const projects = data?.economicResources?.edges?.slice(0, count) ?? [];

  if (!conformsTo || (loading && !data)) {
    return (
      <div className={className}>
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!projects.length) return null;

  return (
    <div className={className}>
      {projects.map(({ node }) => (
        <ProjectCardNew project={node as Partial<EconomicResource>} key={node.id} />
      ))}
    </div>
  );
}
