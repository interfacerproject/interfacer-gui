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

import { PersonWithFileEssential } from "lib/types/extensions";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import BrDisplayUser from "./brickroom/BrDisplayUser";

const AgentsTableRow = (props: { agent: Partial<PersonWithFileEssential> }) => {
  const { agent: e } = props;
  const { t } = useTranslation("common");

  if (!e) return null;

  return (
    <tr>
      <td>
        <BrDisplayUser user={e} />
      </td>
      <td className="">
        <Link href={`/profile/${e.id}`}>
          <a>{e.name}</a>
        </Link>
      </td>
      <td className="max-w-[12rem]">{e.id}</td>
      <td>{e.primaryLocation?.name || t("no location provide")}</td>
    </tr>
  );
};

export default AgentsTableRow;
