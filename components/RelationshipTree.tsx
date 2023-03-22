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
import { useTranslation } from "next-i18next";
import PTitleCounter from "./polaris/PTitleCounter";
import ProjectsCards from "./ProjectsCards";

const RelationshipTree = ({ project }: { project: Partial<EconomicResource> | undefined }) => {
  const { t } = useTranslation("update");

  const relatedProjects = project?.metadata?.relations;
  const proposalFilter = {
    id: relatedProjects,
  };
  return (
    <div className="w-full mt-2" id="relationshipTree">
      <PTitleCounter title={t("Relations")} length={relatedProjects?.length ?? 0} />
      {project && relatedProjects && <ProjectsCards filter={proposalFilter} tiny />}
    </div>
  );
};

export default RelationshipTree;
