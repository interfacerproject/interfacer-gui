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

import SideBarButton from "./SideBarButton";
import { useRouter } from "next/router";

type SideBarMenuProps = { menu: Array<{ name: string; link: string; svg?: any; disabled?: boolean }>; title?: string };

function Sidebar({ menu, title }: SideBarMenuProps) {
  const router = useRouter();
  const isActive = (path: string) => path === router.asPath;
  return (
    <>
      <h4 className="mt-8 ml-4">{title}</h4>
      <ul className="m-4 mb-4 overflow-y-auto border border-white rounded-xl w-60 text-base-content">
        {menu.map(m => (
          <li key={m.name}>
            <SideBarButton text={m.name} link={m.link} active={isActive(m.link)} svg={m?.svg} disabled={m?.disabled} />
          </li>
        ))}
      </ul>
    </>
  );
}

export default Sidebar;
