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
import { useRouter } from "next/router";

import IfSidebarItem, { IfSidebarItemProps } from "./IfSidebarItem";

//

export interface IfSideBarLinkProps extends IfSidebarItemProps {
  link: string;
  target?: string;
}

const IfSideBarLink = (props: IfSideBarLinkProps) => {
  const { link, target, disabled } = props;

  // Adding active state
  const router = useRouter();
  const active = link === router.asPath;

  // The core item
  const item = <IfSidebarItem {...props} active={active} />;

  // The item with the link
  const wrappedItem = (
    <Link href={link} passHref>
      <a target={target}>{item}</a>
    </Link>
  );

  return <li>{disabled ? item : wrappedItem}</li>;
};

export default IfSideBarLink;
