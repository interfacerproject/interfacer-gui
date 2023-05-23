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

import { NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import useFilters from "../hooks/useFilters";
import devLog from "../lib/devLog";
import ProjectsCards from "components/ProjectsCards";

const Resources: NextPage = () => {
  const { resourceFilter } = useFilters();
  devLog("Resources", resourceFilter);
  const { t } = useTranslation("resourcesProps");
  return (
    <div className="p-8">
      <div className="mb-6 w-80">
        <h1>{t("Resources")}</h1>
        <p>{t("Use this page to generate digital product passports of resources")}</p>
      </div>
      <ProjectsCards filter={resourceFilter} />
    </div>
  );
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["resourcesProps", "signInProps", "SideBarProps"])),
    },
  };
}

export default Resources;
