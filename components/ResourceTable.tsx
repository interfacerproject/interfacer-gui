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

import { useQuery } from "@apollo/client";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import devLog from "../lib/devLog";
import BrLoadMore from "./brickroom/BrLoadMore";
import BrTable from "./brickroom/BrTable";
import Spinner from "./brickroom/Spinner";
import { FETCH_RESOURCES } from "../lib/QueryAndMutation";
import useLoadMore from "../hooks/useLoadMore";
import { EconomicResource } from "../lib/types";

const truncate = (input: string, max: number) => (input?.length > max ? `${input.substring(0, max)}...` : input);

const ResourceTable = ({ filter }: { filter?: any }) => {
  const { t } = useTranslation("resourcesProps");
  const { loading, data, error, fetchMore, variables, refetch } = useQuery(FETCH_RESOURCES, {
    variables: {
      last: 10,
      filter: filter,
    },
  });
  devLog(error);

  const dataQueryIdentifier = "economicResources";

  const { loadMore, items, showEmptyState, getHasNextPage } = useLoadMore({
    fetchMore,
    refetch,
    variables,
    data,
    dataQueryIdentifier,
  });

  const economicResources: EconomicResource[] = items;

  return (
    <>
      {data ? (
        <>
          <BrTable headArray={[t("Resource"), t("Source"), t("License"), t("Version")]}>
            {!showEmptyState && (
              <>
                {economicResources.map((e: any) => (
                  <div className="table-row" key={e.node.id} data-test="resource-item">
                    {/* Cell 1 */}
                    <div className="table-cell">
                      <Link href={`/resource/${e.node.id}`}>
                        <a className="flex items-center space-x-4">
                          <img src={e.node.metadata?.image} className="w-20 h-20" />
                          <div className="flex flex-col h-24 space-y-1 w-60">
                            <h4 className="truncate w-60">{e.node.name}</h4>
                            <p className="h-16 overflow-hidden text-sm whitespace-normal text-thin">
                              {truncate(e.node.note, 100)}
                            </p>
                          </div>
                        </a>
                      </Link>
                    </div>

                    {/* Cell 2 */}
                    <div className="table-cell align-top">
                      <span className="font-semibold">{e.node.metadata?.__meta?.source || ""}</span>
                      <br />
                      <Link href={e.node?.repo || ""}>
                        <a className="text-sm" target="_blank">
                          {truncate(e.node.repo || "", 40)}
                        </a>
                      </Link>
                    </div>

                    {/* Cell 3 */}
                    <div className="table-cell align-top">
                      <div className="whitespace-normal">
                        <p>
                          <span className="font-semibold">{e.node.license}</span>
                          <br />
                          <span className="italic">
                            {t("by")} {e.node.licensor}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Cell 4 */}
                    <div className="table-cell text-sm align-top">
                      {t("Version")}
                      {`: ${e.node.version}`}
                      <br />
                      {e.node.okhv}
                    </div>
                  </div>
                ))}
              </>
            )}
            {showEmptyState && (
              <>
                <div className="table-row">
                  <div className="table-cell col-span-full">
                    <h4>{t("There’s nothing to display here")}</h4>
                    <p>
                      {`${t("This table will display the resources that you will have in inventory")}.`}
                      {`${t("Raise, transfer or Produce a resource and it will displayed here")}.`}
                    </p>
                  </div>
                </div>
              </>
            )}
          </BrTable>
          <BrLoadMore handleClick={loadMore} hidden={!getHasNextPage} text={"Load more"} />
        </>
      ) : (
        <Spinner />
      )}
    </>
  );
};

export default ResourceTable;
