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

import { EconomicResource, FetchInventoryQuery } from "lib/types";
import { useTranslation } from "next-i18next";

// Components
import Link from "next/link";
import ProjectsTableRow from "./ProjectsTableRow";
import BrTable from "./brickroom/BrTable";

//

export interface ProjectsTableBaseProps {
  projects: EconomicResource[];
  hidePagination?: boolean;
  onLoadMore?: () => void;
  showEmptyState?: boolean;
  hasNextPage?: boolean;
}

//

export default function ProjectsTableBase(props: ProjectsTableBaseProps) {
  const { projects, hidePagination = false, onLoadMore = () => {}, showEmptyState = !projects, hasNextPage } = props;
  const { t } = useTranslation("lastUpdatedProps");

  return (
    <div>
      <BrTable headArray={[t("Project"), t("Project Type"), t("Last update"), t("tags"), t("Owner")]}>
        {projects?.map((e: any) => (
          <ProjectsTableRow project={e} key={e.cursor} />
        ))}
      </BrTable>

      {/* Empty state */}
      {showEmptyState && (
        <div className="p-4 pt-6">
          <h4>{t("Create a new project")}</h4>
          <p className="pt-2 pb-5 font-light text-white-700">{t("empty_state_projects")}</p>
          <Link href="/create_project">
            <a className="btn btn-accent btn-md">{t("Create project")}</a>
          </Link>
        </div>
      )}

      {/* Pagination */}
      {!hidePagination && (
        <div className="w-full pt-4 text-center">
          {hasNextPage && (
            <button className="text-center btn btn-primary" onClick={onLoadMore}>
              {t("Load more")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
