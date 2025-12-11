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
import { useState } from "react";
import Spinner from "./brickroom/Spinner";
import WithFilterLayout from "./layout/WithFilterLayout";

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
        <WithFilterLayout
          header={header}
          length={length}
          hidePrimaryAccountable={hidePrimaryAccountable}
          hideFilters={hideFilters}
        >
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
        </WithFilterLayout>
      )}
    </>
  );
};
export default CardsGroup;
