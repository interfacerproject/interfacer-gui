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

import React, { ReactElement, ReactNode } from "react";

export enum CardWidth {
  SM = "w-24",
  LG = "md:w-128",
  XL = "md:w-156",
  Full = "w-full",
}

type CardProps = {
  title?: string;
  action?: { name: string; handle: Function };
  children: ReactNode;
  width?: CardWidth;
  className?: string;
};

const Card = (props: CardProps) => {
  const cardCss = `${props.width} ${props.className} card bg-base-100 shadow-xl`;
  return (
    <>
      <div className={cardCss}>
        <div className="card-body">
          <>
            {props.title && <h1 className="card-title heading1">{props.title}</h1>}
            {props.children}
            {props.action && (
              <div className="justify-end card-actions">
                <button onClick={props.action.handle()} className="btn btn-primary">
                  {props.action.name}
                </button>
              </div>
            )}
          </>
        </div>
      </div>
    </>
  );
};
export default Card;
