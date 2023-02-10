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

// @ts-ignore
import classNames from "classnames";
import Link from "next/link";
import React from "react";

type IfSideBarButtonProps = {
  text: string;
  link: string;
  active?: boolean;
  svg?: React.ReactNode;
  disabled?: boolean;
  w?: number | string;
  tag?: string | boolean;
  target?: string;
};

const IfSideBarButton = ({
  text,
  link,
  active = false,
  svg,
  disabled = false,
  w = "full",
  tag = false,
  target = "_self",
}: IfSideBarButtonProps) => {
  const widthClass = `w-${w}`;
  const linkClasses = classNames({
    "ml-4 gap-2 pl-0 btn btn-ghost font-medium normal-case rounded-lg border-2": true,
    "text-primary hover:bg-amber-200": !disabled,
    "mb-0.5 text-white btn-disabled border-0": disabled,
    "border-white": !active,
    "border-amber-200": active,
    [`${widthClass}`]: true,
  });
  const buttonClasses = classNames({
    "flex items-center items-center w-full pl-3 text-left": true,
  });

  const linkElement = (
    <span className={buttonClasses}>
      <div className="flex items-center flex-1">
        {svg}
        {text}
      </div>
      {tag && (
        <span className="inline-flex items-center justify-center px-1 py-0.5 text-xs rounded-lg font-display text-primary bg-accent">
          {tag}
        </span>
      )}
    </span>
  );

  return (
    <>
      {disabled ? (
        <button className={linkClasses} disabled>
          {linkElement}
        </button>
      ) : (
        <Link href={link} passHref>
          <a className={linkClasses} target={target}>
            {linkElement}
          </a>
        </Link>
      )}
    </>
  );
};
export default IfSideBarButton;
