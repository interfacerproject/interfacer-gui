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

import cn from "classnames";
import { useTranslation } from "next-i18next";

// Request
import { useQuery } from "@apollo/client";
import { FETCH_AGENTS } from "lib/QueryAndMutation";

// Components
import { GetAgentsQuery, GetAgentsQueryVariables } from "lib/types";
import useLoadMore from "../hooks/useLoadMore";
import AgentsTableBase from "./AgentsTableBase";
import EmptyState from "./EmptyState";
import Spinner from "./brickroom/Spinner";

//

export interface AgentsTableProps {
  hideHeader?: boolean;
  hidePagination?: boolean;
  id?: string[];
  searchFilter?: React.ReactNode;
  searchTerm: string;
}

//

export default function AgentsTable(props: AgentsTableProps) {
  const { t } = useTranslation("lastUpdatedProps");
  const { hideHeader = false, hidePagination = false, searchTerm, searchFilter } = props;

  const { loading, data, fetchMore, refetch, variables } = useQuery<GetAgentsQuery, GetAgentsQueryVariables>(
    FETCH_AGENTS,
    {
      variables: { last: 10, userOrName: searchTerm || "" },
    }
  );

  const dataQueryIdentifier = "people";

  const { loadMore, showEmptyState } = useLoadMore({
    fetchMore,
    refetch,
    variables,
    data,
    dataQueryIdentifier,
  });

  return (
    <>
      {loading && (
        <div className="w-full">
          <Spinner />
        </div>
      )}
      {!loading && (
        <div className="flex flex-col">
          {/* Header */}
          <div
            className={cn("flex items-center py-5", { "justify-end": hideHeader }, { "justify-between": !hideHeader })}
          >
            {/* Left side */}
            {!hideHeader && <h3>{t("Projects")}</h3>}
          </div>
          {/* Table and filters */}
          <div className="flex flex-row flex-nowrap items-start space-x-8">
            <div className="grow">
              {showEmptyState || !data ? (
                <EmptyState heading={t("No agents found")} />
              ) : (
                <AgentsTableBase data={data} onLoadMore={loadMore} hidePagination={hidePagination} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
