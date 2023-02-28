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

import { Stack } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import MdParser from "../lib/MdParser";
import { EconomicResource } from "../lib/types";
import BrTags from "./brickroom/BrTags";

const ProjectDetailOverview = ({ project }: { project: EconomicResource }) => {
  const { t } = useTranslation("common");

  const tags = project?.classifiedAs;
  const text = project?.note;

  return (
    <Stack vertical>
      {text && <div className="prose" dangerouslySetInnerHTML={{ __html: MdParser.render(text) }} />}
      {tags && <BrTags tags={tags} />}
    </Stack>
  );
};

export default ProjectDetailOverview;
