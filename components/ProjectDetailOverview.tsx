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
import LicenseDisplay from "./LicenseDisplay";
import { LicenseStepValues } from "./partials/create/project/steps/LicenseStep";

const ProjectDetailOverview = ({ project }: { project: EconomicResource }) => {
  const { t } = useTranslation("common");

  const tags = project?.classifiedAs;
  const text = project?.note;
  const licenses: LicenseStepValues = project?.metadata?.licenses;

  return (
    <Stack vertical>
      {text && <div className="prose" dangerouslySetInnerHTML={{ __html: MdParser.render(text) }} />}
      {tags && <BrTags tags={tags} />}
      {licenses && (
        <>
          <Text as="h3" variant="headingLg">
            {t("Licenses")}
          </Text>
          {licenses.map((l, i) => (
            <LicenseDisplay licenseId={l.licenseId} label={l.scope} key={i} />
          ))}
        </>
      )}
    </Stack>
  );
};

export default ProjectDetailOverview;
