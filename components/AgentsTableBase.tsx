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

// Components
import { GetAgentsQuery } from "lib/types";
import AgentsTableRow from "./AgentsTableRow";
import BrTable from "./brickroom/BrTable";

//

export interface ProjectsTableBaseProps {
  data: GetAgentsQuery;
  hidePagination?: boolean;
  onLoadMore?: () => void;
}

//

export default function AgentsTableBase(props: ProjectsTableBaseProps) {
  const { data, hidePagination = false, onLoadMore = () => {} } = props;
  const { t } = useTranslation("common");

  const agents = data.people?.edges;
  const hasNextPage = data.people?.pageInfo.hasNextPage;

  //

  return (
    <div>
      <BrTable headArray={[t(""), t("name"), t("id"), t("location")]}>
        {agents?.map(e => (
          <AgentsTableRow agent={e.node} key={e.cursor} />
        ))}
      </BrTable>

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
