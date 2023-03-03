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
import { useRouter } from "next/router";
import React, { ReactNode, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import Footer from "../Footer";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";

type layoutProps = {
  children: ReactNode;
  bottomPadding?: "none" | "lg";
};

const Layout: React.FunctionComponent<layoutProps> = (layoutProps: layoutProps) => {
  const { bottomPadding = "lg" } = layoutProps;
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

  const calcBottomPadding = classNames({
    "pb-0": bottomPadding === "none",
    "pb-20": bottomPadding === "lg",
  });

  return (
    <>
      {authenticated ? (
        <div className="drawer">
          <input id="my-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col">
            <Topbar />
            <div className={`max-w-full flex-grow ${calcBottomPadding}`}>{layoutProps?.children}</div>
            <Footer />
          </div>
          <div className="drawer-side">
            <label htmlFor="my-drawer" className="drawer-overlay" />
            <Sidebar />
          </div>
        </div>
      ) : (
        <div>
          <div>{layoutProps?.children}</div>
          <Footer />
        </div>
      )}
    </>
  );
};

export default Layout;
