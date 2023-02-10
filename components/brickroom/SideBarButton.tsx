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

type SideBarButtonProps = {
  text: string;
  link: string;
  active?: boolean;
  svg?: React.ReactNode;
  disabled?: boolean;
};

const SideBarButton = ({ text, link, active, svg, disabled }: SideBarButtonProps) => {
  const css = `border-l-4 gap-2 left-4 pl-0 btn btn-ghost btn-block font-medium normal-case text-white ${
    !active && `bg-[#101828]`
  }
     border-0 hover:bg-neutral-focus hover:border-l-accent ${active && `border-l-accent bg-neutral-focus`}`;
  return (
    <>
      {disabled ? (
        <a className={css}>
          <button
            className={`flex flex-row items-center w-full pl-3 text-left ${disabled ? "btn-disabled" : ""}`}
            disabled={disabled}
          >
            <>
              {svg}
              {text}
            </>
          </button>
        </a>
      ) : (
        <Link href={link} passHref>
          <a className={css}>
            <button
              className={`flex flex-row items-center w-full pl-3 text-left ${disabled ? "btn-disabled" : ""}`}
              disabled={disabled}
            >
              <>
                {svg}
                {text}
              </>
            </button>
          </a>
        </Link>
      )}
    </>
  );
};
export default SideBarButton;
