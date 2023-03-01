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

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import LocationMenu from "./LocationMenu";
import NotificationBell from "./NotificationBell";
import SearchBar from "./SearchBar";

type topbarProps = {
  userMenu?: boolean;
  search?: boolean;
  children?: React.ReactNode;
  cta?: React.ReactNode;
  burger?: boolean;
};

function Topbar({ search = true, children, userMenu = true, cta, burger = true }: topbarProps) {
  const router = useRouter();
  const path = router.asPath;
  const { t } = useTranslation("common");
  const isSignup = path === "/sign_up";
  const isSignin = path === "/sign_in";

  return (
    <div className="navbar bg-[#F3F3F1] px-2 py-1 h-16 border-b border-text-primary sticky top-0 z-50">
      <div className="navbar-start">
        {children}
        {burger && (
          <label htmlFor="my-drawer" className="btn btn-square btn-ghost drawer-button mr-2" id="sidebarOpener">
            <svg width="48" height="48" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11 13C11 12.4477 11.4477 12 12 12H24C24.5523 12 25 12.4477 25 13C25 13.5523 24.5523 14 24 14H12C11.4477 14 11 13.5523 11 13Z"
                fill="#036A53"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11 18C11 17.4477 11.4477 17 12 17H18C18.5523 17 19 17.4477 19 18C19 18.5523 18.5523 19 18 19H12C11.4477 19 11 18.5523 11 18Z"
                fill="#036A53"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11 23C11 22.4477 11.4477 22 12 22H24C24.5523 22 25 22.4477 25 23C25 23.5523 24.5523 24 24 24H12C11.4477 24 11 23.5523 11 23Z"
                fill="#036A53"
              />
            </svg>
          </label>
        )}
        {search && <SearchBar />}
      </div>
      <div className="navbar-end">
        {cta}
        {userMenu && <NotificationBell />}
        {(isSignup || isSignin) && (
          <div className="flex mr-2 space-x-2">
            <button className="btn btn-primary" onClick={() => router.push("/sign_in")}>
              {t("Login")}
            </button>
            <button className="btn btn-accent" onClick={() => router.push("/sign_up")}>
              {t("Sign up")}
            </button>
          </div>
        )}
        <LocationMenu />
      </div>
    </div>
  );
}

export default Topbar;
