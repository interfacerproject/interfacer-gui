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

import { Card, Tag, Text } from "@bbtgnn/polaris-interfacer";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import ProjectThumb from "./ProjectThumb";
import { useQuery } from "@apollo/client";
import { QUERY_RESOURCE } from "../lib/QueryAndMutation";
import devLog from "../lib/devLog";

//

export interface Props {
  resource: Partial<EconomicResource> | null | undefined;
}

//

const ResourceDetailsCard = (props: Props) => {
  const { resource } = props;
  const { t } = useTranslation("common");

  const { data } = useQuery(QUERY_RESOURCE, { variables: { id: resource?.id } });

  if (!resource) return null;

  // Preparing data
  const type = resource.conformsTo?.name;
  const owner = resource.primaryAccountable?.name;

  return (
    <Card>
      <div className="p-4 flex flex-row items-start space-x-4">
        <ProjectThumb project={data?.economicResource} />

        <div className="grow">
          <Text as="h4" variant="headingMd" fontWeight="bold">
            {resource.name}
          </Text>
          {owner && (
            <Text as="p" variant="bodyMd">
              <span className="after:content-[':_']">{t("Owner")}</span>
              <span className="font-mono font-bold">{owner}</span>
            </Text>
          )}
        </div>

        {type && <Tag>{resource.conformsTo?.name}</Tag>}
      </div>
    </Card>
  );
};

//

export default ResourceDetailsCard;
