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
 * The card shown inside a map popup.
 *
 * Reference: DTEC prototype node 943:60941 (MapMiniCard). It is the compact
 * sibling of the project-detail card: same thumbnail-with-type-label treatment
 * and the same entity-type colour, laid out horizontally at 120px thumbnail +
 * text so it fits over the map without covering it.
 */

import EntityTypeIcon from "components/EntityTypeIcon";
import { ProjectType } from "components/types";
import findProjectImages from "lib/findProjectImages";
import { isProjectType } from "lib/isProjectType";
import { EconomicResource } from "lib/types";
import Link from "next/link";

/** Accent per entity type, matching the catalogue cards. */
const entityTypeColor: Record<ProjectType, string> = {
  [ProjectType.DESIGN]: "var(--ifr-green)",
  [ProjectType.PRODUCT]: "var(--ifr-type-product)",
  [ProjectType.SERVICE]: "var(--ifr-type-service)",
  [ProjectType.DPP]: "var(--ifr-type-dpp)",
  [ProjectType.MACHINE]: "var(--ifr-green)",
};

function getProjectType(project: Partial<EconomicResource>): ProjectType {
  const name = project.conformsTo?.name;
  if (!name) return ProjectType.DESIGN;
  const check = isProjectType(name);
  if (check[ProjectType.PRODUCT]) return ProjectType.PRODUCT;
  if (check[ProjectType.SERVICE]) return ProjectType.SERVICE;
  if (check[ProjectType.DPP]) return ProjectType.DPP;
  if (check[ProjectType.MACHINE]) return ProjectType.MACHINE;
  return ProjectType.DESIGN;
}

export interface MapMiniCardProps {
  project: Partial<EconomicResource>;
}

export default function MapMiniCard({ project }: MapMiniCardProps) {
  const type = getProjectType(project);
  const accent = entityTypeColor[type];
  const image = findProjectImages(project)?.[0];
  const provider = project.primaryAccountable?.name;
  const location = project.currentLocation?.mappableAddress || project.currentLocation?.name;

  return (
    <Link href={`/project/${project.id}`}>
      <a
        className="flex h-[120px] w-[318px] items-stretch overflow-hidden rounded-ifr-lg border border-ifr bg-ifr-surface no-underline transition-shadow hover:shadow-ifr-dropdown"
        style={{ boxShadow: "0px 4px 16px 0px rgba(0, 0, 0, 0.12)" }}
      >
        <div className="relative h-auto w-[120px] shrink-0 overflow-hidden bg-ifr-search">
          {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />}
          <span
            aria-hidden
            className="absolute left-0 top-0 flex h-8 items-center rounded-ifr-sm px-2"
            style={{ backgroundColor: accent }}
          >
            <EntityTypeIcon type={type} size="default" fill="#fff" />
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1 px-3 py-2.5">
          <p className="truncate text-[14px] font-semibold leading-[21px] text-ifr-text-primary">{project.name}</p>
          {provider && <p className="truncate text-[12px] leading-[18px] text-ifr-text-secondary">{provider}</p>}
          {location && (
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span aria-hidden className="h-[5px] w-[5px] shrink-0 rounded-full" style={{ backgroundColor: accent }} />
              <span className="truncate text-[12px] leading-[18px]" style={{ color: accent }}>
                {location}
              </span>
            </div>
          )}
        </div>
      </a>
    </Link>
  );
}
