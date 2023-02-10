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

import React, { useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/outline";
import IfSidebarItem, { IfSidebarItemProps } from "./IfSidebarItem";

//

export interface IfSidebarDropdownProps extends IfSidebarItemProps {
  children: Array<JSX.Element>;
}

const IfSidebarDropdown = (props: IfSidebarDropdownProps) => {
  const [open, setOpen] = useState(false);

  const upIcon = <ChevronUpIcon className="w-5 h-5" />;
  const downIcon = <ChevronDownIcon className="w-5 h-5" />;

  return (
    <li className="flex flex-col items-stretch">
      {/* The button */}
      <button onClick={() => setOpen(!open)}>
        <IfSidebarItem {...props} rightIcon={open ? upIcon : downIcon} />
      </button>

      {/* The space that opens up */}
      {open && (
        <ul className="mt-1 space-y-1 pl-7">
          <>{props.children}</>
        </ul>
      )}
    </li>
  );
};

export default IfSidebarDropdown;
