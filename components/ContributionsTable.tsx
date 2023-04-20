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
import dayjs from "dayjs";
import { QUERY_RESOURCE_PROPOSAlS } from "lib/QueryAndMutation";
import { ResourceProposalsQuery, ResourceProposalsQueryVariables } from "lib/types";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import BrDisplayUser from "./brickroom/BrDisplayUser";
import BrTable from "./brickroom/BrTable";
import PTitleCounter from "./polaris/PTitleCounter";

const ContributionsTable = ({ id, title }: { id: string; title?: string }) => {
  const { t } = useTranslation("common");
  const { data } = useQuery<ResourceProposalsQuery, ResourceProposalsQueryVariables>(QUERY_RESOURCE_PROPOSAlS, {
    variables: { id: id },
  });
  const proposals = data?.proposals.edges;

  return (
    <>
      <PTitleCounter title={title} length={proposals?.length} />
      <BrTable headArray={[t("Username"), t("Description"), t("Last update"), t("Status")]}>
        {proposals &&
          proposals.map(proposal => (
            <Link href={`/proposal/${proposal.node.id}`} key={proposal.node.id}>
              <tr className="cursor-pointer">
                <td>
                  {/* @ts-ignore */}
                  <BrDisplayUser user={proposal.node.primaryIntents![0].provider!} />
                </td>
                <td>{proposal.node.note}</td>
                <td>
                  <p className="mr-1">{dayjs(proposal.node.created).fromNow()}</p>
                  <p className="text-xs">{dayjs(proposal.node.created).format("HH:mm")}</p>
                  <p className="text-xs">{dayjs(proposal.node.created).format("DD/MM/YYYY")}</p>
                </td>
                <td>{proposal.node.status}</td>
              </tr>
            </Link>
          ))}
      </BrTable>
    </>
  );
};

export default ContributionsTable;
