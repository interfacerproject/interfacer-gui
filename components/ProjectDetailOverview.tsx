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

import { Icon, Stack } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import MdParser from "../lib/MdParser";
import { MACHINE_TYPES } from "../lib/resourceSpecs";
import { EconomicResource } from "../lib/types";
import BrTags from "./brickroom/BrTags";

interface ProjectDetailOverviewProps {
  project: Partial<EconomicResource>;
  machines?: EconomicResource[];
}

const ProjectDetailOverview = ({ project, machines = [] }: ProjectDetailOverviewProps) => {
  const tags = project?.classifiedAs;
  const text = project?.note;
  const { t } = useTranslation("common");

  return (
    <Stack vertical>
      {text && (
        <div id="project-overview" className="prose" dangerouslySetInnerHTML={{ __html: MdParser.render(text) }} />
      )}
      {tags && <BrTags tags={tags} />}
      {machines.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">{t("Machines Used")}</h3>
          <div className="flex flex-wrap gap-3">
            {machines.map(machine => {
              const machineType = MACHINE_TYPES.find(mt =>
                machine.name?.toLowerCase().includes(mt.name.toLowerCase())
              );
              const IconName = machineType?.icon;
              return (
                <div
                  key={machine.id}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  {IconName && <Icon source={IconName} />}
                  <span className="font-medium">{machine.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Stack>
  );
};

export default ProjectDetailOverview;
