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
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";

// Components
import ProjectsTable from "components/ProjectsTable";
import NewProjectButton from "components/NewProjectButton";
import useFilters from "../hooks/useFilters";

//

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["signInProps", "lastUpdatedProps", "SideBarProps"])),
    },
  };
}

//

export default function Projects() {
  const { t } = useTranslation("lastUpdatedProps");
  const { proposalFilter } = useFilters();
  return (
    <div className="p-8">
      <div className="mb-6 w-96">
        <h1>{t("Latest projects")}</h1>
        <p className="my-2">{t("Most recently updated projects")}</p>
        <NewProjectButton />
        <Link href="https://github.com/dyne/interfacer-gui/issues/new">
          <a target="_blank" className="ml-2 normal-case btn btn-accent btn-outline btn-md">
            {t("Report a bug")}
          </a>
        </Link>
      </div>

      {/*  */}
      <ProjectsTable filter={proposalFilter} />
    </div>
  );
}
