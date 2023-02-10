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

import { useRouter } from "next/router";
import React, { ReactNode, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";

type layoutProps = {
  children: ReactNode;
};

const Layout: React.FunctionComponent<layoutProps> = (layoutProps: layoutProps) => {
  const { authenticated } = useAuth();
  const router = useRouter();

  // Closes sidebar automatically when route changes
  useEffect(() => {
    router.events.on("routeChangeComplete", () => {
      let drawer = document.getElementById("my-drawer");
      if (drawer) {
        (drawer as HTMLInputElement).checked = false;
      }
    });
  }, [router.events]);

  return (
    <>
      {authenticated ? (
        <div className="drawer">
          <input id="my-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content">
            <Topbar search={false} />
            <div className="bg-[#F3F3F1] max-w-full">{layoutProps?.children}</div>
          </div>
          <div className="drawer-side">
            <label htmlFor="my-drawer" className="drawer-overlay" />
            <Sidebar />
          </div>
        </div>
      ) : (
        <div className="bg-[#F3F3F1]">{layoutProps?.children}</div>
      )}
    </>
  );
};

export default Layout;
