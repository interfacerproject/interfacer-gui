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

import React, { useState } from "react";

type BrPaginationProps = {
  max: number;
  handleStart: any;
  handleEnd: any;
};

const BrPagination = (props: BrPaginationProps) => {
  const [current, setCurrent] = useState(0);
  const isNearCurrent = (a: number) => (current - 2 < a && current + 2 > a) || a === 0 || a === props.max - 1;
  const isBeforeOrAfterCurrent = (a: number) =>
    current - 2 === a || (current + 2 === a && a !== 0 && a !== props.max - 1);

  return (
    <div className="grid grid-cols-1 gap-4 place-items-center">
      <div className="btn-group ">
        {props.max &&
          Array.from(Array(props.max).keys()).map(a => (
            <>
              {isNearCurrent(a) && (
                <button
                  key={a + 1}
                  onClick={() => {
                    props.handleStart(a * 10);
                    props.handleEnd(a * 10 + 10);
                    setCurrent(a);
                  }}
                  className="btn btn-ghost btn-xs"
                >
                  {a + 1}
                </button>
              )}
              {isBeforeOrAfterCurrent(a) && <span>...</span>}
            </>
          ))}
      </div>
    </div>
  );
};

export default BrPagination;
