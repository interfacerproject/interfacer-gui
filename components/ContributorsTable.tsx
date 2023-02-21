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

import { useTranslation } from "next-i18next";
import Link from "next/link";
import dayjs from "../lib/dayjs";
import BrTable from "./brickroom/BrTable";
import BrUserDisplay from "./brickroom/BrUserDisplay";

const ContributorsTable = ({ contributors, title, data }: { contributors?: string[]; title?: string; data: any }) => {
  const { t } = useTranslation("common");
  return (
    <>
      {title && <h3 className="my-2 my-6">{title}</h3>}
      <BrTable headArray={[t("Username"), t("Date")]}>
        {contributors &&
          contributors.map(contributor => (
            <tr key={contributor}>
              <td>
                <Link href={`/profile/${contributor}`}>
                  <a>
                    <BrUserDisplay userId={contributor} />
                  </a>
                </Link>
              </td>
              <td>
                <p className="mr-1">{dayjs(data).fromNow()}</p>
                <p className="text-xs">{dayjs(data).format("HH:mm")}</p>
                <p className="text-xs">{dayjs(data).format("DD/MM/YYYY")}</p>
              </td>
            </tr>
          ))}
      </BrTable>
    </>
  );
};

export default ContributorsTable;
