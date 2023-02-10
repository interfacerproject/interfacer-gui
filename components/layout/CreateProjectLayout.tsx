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

import { ArrowLeftIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import React, { ReactNode } from "react";
import Topbar from "../Topbar";
import { useTranslation } from "next-i18next";

type layoutProps = {
  children: ReactNode;
  cta?: ReactNode;
};

const Layout: React.FunctionComponent<layoutProps> = (layoutProps: layoutProps) => {
  const router = useRouter();
  const { t } = useTranslation("common");

  return (
    <>
      <>
        <div className="drawer drawer-mobile">
          <input id="my-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content">
            {/* Topbar */}
            <Topbar search={false} userMenu={false} cta={layoutProps.cta}>
              <div className="hidden w-auto h-16 p-4 mx-2 border-r md:block">
                <div className="mx-auto logo" />
              </div>
              <button className="btn btn-primary btn-outline" id="back" onClick={() => router.back()}>
                <ArrowLeftIcon className="w-5 h-5" />
                <p className="ml-2">{t("Go back and discard")}</p>
              </button>
            </Topbar>

            {/* Page contents */}
            <div className="container bg-[#F3F3F1] max-w-full">{layoutProps?.children}</div>
          </div>
        </div>
      </>
    </>
  );
};

export default Layout;
