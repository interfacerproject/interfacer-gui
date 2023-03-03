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

import React from "react";

type BrTableProps = {
  headArray: Array<string>;
  children: React.ReactNode;
  emptyState?: string | React.ReactNode;
};

const BrTable = ({ headArray, children, emptyState = "0 results" }: BrTableProps) => {
  return (
    <>
      <div className="overflow-x-auto rounded-box">
        <div className="table w-full rounded-box">
          {/* The header */}
          <div className="table-header-group bg-white-100">
            <div className="table-row">
              {headArray.map(p => (
                <div className="table-cell p-4 text-sm font-normal text-neutral whitespace-nowrap" key={p}>
                  {p}
                </div>
              ))}
            </div>
          </div>
          {/* The children */}
          <div className="bg-['#F9F9F7'] table-row-group">
            {children ? children : <div className="p-5">{emptyState}</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default BrTable;
