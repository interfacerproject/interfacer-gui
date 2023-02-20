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

import { Stack, Text } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import MdParser from "../lib/MdParser";
import { EconomicResource } from "../lib/types";
import BrTags from "./brickroom/BrTags";

const ProjectDetailOverview = ({ project }: { project: Partial<EconomicResource> }) => {
  const { t } = useTranslation("common");

  const license = project?.license;
  const tags = project?.classifiedAs;
  const text = project?.note;

  return (
    <Stack vertical>
      {text && <div dangerouslySetInnerHTML={{ __html: MdParser.render(text) }} />}

      {tags && (
        <div>
          <Text as="h2" variant="headingMd">
            {t("Tags")}
          </Text>
          <BrTags tags={tags} />
        </div>
      )}

      {license && (
        <div>
          <Text as="h2" variant="headingMd">
            {t("License")}
          </Text>
          <p>{license}</p>
        </div>
      )}
    </Stack>
  );
};

export default ProjectDetailOverview;
