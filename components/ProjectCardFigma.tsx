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

import { EconomicResource } from "lib/types";
import GeneralCard from "./GeneralCard";

/**
 * ProjectCardFigma - Card component based on the Figma design
 * Reference: https://www.figma.com/design/fZm62oTpY4srzipfiBQ1vR/DTEC---Prototypes?node-id=134-4725
 *
 * This card displays:
 * - Image with user avatar and star count overlay
 * - Project type badge on the image
 * - Title and description
 * - Resource requirements
 * - License information
 */

export interface ProjectCardFigmaProps {
  project: Partial<EconomicResource>;
}

export default function ProjectCardFigma(props: ProjectCardFigmaProps) {
  const { project } = props;

  return (
    <GeneralCard project={project}>
      <GeneralCard.CardHeader>
        <GeneralCard.RemoteImage />
      </GeneralCard.CardHeader>
      <GeneralCard.CardBody>
        <GeneralCard.ProjectTitleAndStats />
      </GeneralCard.CardBody>
      <GeneralCard.CardFooter>
        <>
          <GeneralCard.ResourceRequirements />
          <GeneralCard.LicenseFooter />
        </>
      </GeneralCard.CardFooter>
    </GeneralCard>
  );
}
