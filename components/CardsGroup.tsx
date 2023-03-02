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

import { AdjustmentsIcon } from "@heroicons/react/outline";
import cn from "classnames";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import Spinner from "./brickroom/Spinner";
import PTitleCounter from "./polaris/PTitleCounter";
import ProjectsFilters from "./ProjectsFilters";

export interface CardsGroupProps {
  hidePagination?: boolean;
  hidePrimaryAccountable?: boolean;
  header?: string;
  hideFilters?: boolean;
  children: React.ReactNode;
  onLoadMore: () => void;
  nextPage: boolean;
  loading: boolean;
  length?: number;
}

const CardsGroup = (props: CardsGroupProps) => {
  const {
    header,
    hidePagination = false,
    hidePrimaryAccountable = false,
    hideFilters = false,
    children,
    onLoadMore,
    loading,
    nextPage,
    length = 0,
  } = props;

  const { t } = useTranslation("lastUpdatedProps");

  const [showFilter, setShowFilter] = useState(false);
  const toggleFilter = () => setShowFilter(!showFilter);

  return (
    <>
      {loading && (
        <div className="w-full mt-10">
          <Spinner />
        </div>
      )}
      {!loading && (
        <div className="flex flex-col">
          {/* Header */}
          {header && (
            <div className="flex items-center justify-between py-5">
              {/* Left side */}
              <PTitleCounter title={header} titleTag="h2" length={length} />

              {/* Right side */}
              {hideFilters && (
                <button
                  onClick={toggleFilter}
                  className={cn(
                    "gap-2 text-white-700 font-normal normal-case rounded-[4px] border-1 btn btn-sm btn-outline border-white-600 bg-white-100 hover:text-accent hover:bg-white-100",
                    { "bg-accent text-white-100": showFilter }
                  )}
                >
                  <AdjustmentsIcon className="w-5 h-5" /> {t("Filter by")}
                </button>
              )}
            </div>
          )}
          <div className="flex flex-row flex-nowrap items-start space-x-8 w-full">
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* CARDS */}
                {children}
              </div>
              {/* Pagination */}
              {!hidePagination && nextPage && (
                <div className="w-full pt-4 text-center">
                  <button className="text-center btn btn-primary" onClick={onLoadMore} disabled={!nextPage}>
                    {t("Load more")}
                  </button>
                </div>
              )}
            </div>
            {hideFilters && showFilter && (
              <div className="basis-96 sticky top-8">
                <ProjectsFilters hidePrimaryAccountable={hidePrimaryAccountable} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
export default CardsGroup;
