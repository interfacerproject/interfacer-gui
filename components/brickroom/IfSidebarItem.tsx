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

import classNames from "classnames";
import IfSidebarTag from "./IfSidebarTag";

export interface IfSidebarItemProps {
  text: string;
  tag?: string;
  disabled?: boolean;
  active?: boolean;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
}

const IfSidebarItem = ({ text, tag, leftIcon, rightIcon, disabled = false, active = false }: IfSidebarItemProps) => {
  const classes = classNames({
    // Base styles
    "flex flex-row justify-between": true,
    "font-medium normal-case rounded-lg border-2 p-4": true,
    // Disabled styles
    "text-primary hover:bg-amber-200": !disabled,
    "text-gray-400 border-0": disabled,
    // Active styles
    "border-none": !active,
    "border-amber-200": active,
  });

  return (
    <div className={classes}>
      {/* Left side */}
      <div className="flex flex-row items-center justify-start space-x-2">
        {leftIcon}
        <p>{text}</p>
      </div>
      {/* Right side */}
      <div className="flex flex-row items-center justify-end space-x-2">
        {tag && <IfSidebarTag text={tag} />}
        <p>{rightIcon}</p>
      </div>
    </div>
  );
};

export default IfSidebarItem;
