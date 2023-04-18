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
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import BrUserAvatar from "./brickroom/BrUserAvatar";

export default function LoginBtn() {
  const { logout, user } = useAuth();
  const { t } = useTranslation("common");

  return (
    <>
      <div className="mt-1 btn btn-ghost btn-block text-primary w-60 hover:bg-transparent">
        <span className="flex flex-row items-center w-full pl-3 text-left">
          <div className="grid items-center grid-cols-2 p-2 pl-0">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar bordered border-accent">
              <Link href={user!.profileUrl}>
                <a>{user && <BrUserAvatar user={user} size="40px" />}</a>
              </Link>
            </label>
            <div className="grid grid-cols-1 ml-1 text-xs font-normal normal-case gap-y-1">
              <Link href={user!.profileUrl}>
                <a>
                  <p className="text-base-400 whitespace-nowrap test-2xs">{user?.username}</p>
                </a>
              </Link>
              <button className="text-left hover:text-accent" onClick={() => logout()} data-test="signOut">
                {t("Sign Out")}
              </button>
            </div>
          </div>
        </span>
      </div>
    </>
  );
}
