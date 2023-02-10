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

import React from "react";
import Link from "next/link";
import Avatar from "boring-avatars";
import { useTranslation } from "next-i18next";

const AgentsTableRow = (props: any) => {
  const e = props.agent.node;
  const { t } = useTranslation("common");
  return (
    <>
      {e && (
        <tr>
          <td>
            <div className="w-9 hover:w-14">
              <Avatar
                size={"full"}
                name={e.name}
                variant="beam"
                colors={["#F1BD4D", "#D8A946", "#02604B", "#F3F3F3", "#014837"]}
              />
            </div>
          </td>
          <td className="">
            <Link href={e.id}>
              <a>{e.name}</a>
            </Link>
          </td>
          <td className="max-w-[12rem]">{e.id}</td>
          <td>{e.primaryLocation?.name || t("no location provide")}</td>
        </tr>
      )}
    </>
  );
};

export default AgentsTableRow;
