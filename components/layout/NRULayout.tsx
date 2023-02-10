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

import React, { ReactNode } from "react";
import Topbar from "../Topbar";
import Link from "next/link";

type layoutProps = {
  children: ReactNode;
  cta?: ReactNode;
};

const NRULayout: React.FunctionComponent<layoutProps> = (layoutProps: layoutProps) => {
  return (
    <>
      <Topbar search={false} userMenu={false} cta={layoutProps.cta}>
        <div className="flex hidden w-auto p-4 mx-2 align-middle border-r md:block">
          <Link href="/">
            <div className="mx-auto logo" />
          </Link>
        </div>
      </Topbar>
      <div className="container bg-[#F3F3F1] max-w-full">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <img
            src="https://www.interfacerproject.eu/projects/index/ABOUT.png"
            className={"w-full h-full object-cover md:h-screen hidden md:block"}
          />
          <div className="h-full">{layoutProps?.children}</div>
        </div>
      </div>
    </>
  );
};

export default NRULayout;
