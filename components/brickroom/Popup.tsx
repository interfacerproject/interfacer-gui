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

import React, { ReactEventHandler } from "react";

type PopupPops = {
  name: string;
  action1: string;
  action2?: ReactEventHandler;
  buttons?: any;
  children?: any;
  svg?: React.ReactNode;
  disabled?: boolean;
  outlined?: boolean;
  XL?: boolean;
};

function Popup({ name, action1, action2, buttons, children, svg, disabled, outlined, XL }: PopupPops) {
  const larger = XL ? "w-156 max-w-5xl" : "";
  const disabledClass = disabled ? "btn-disabled" : "";
  const outlinedClass = outlined ? "btn-outline" : "";
  const x = "x";
  return (
    <>
      <label
        htmlFor={name}
        className={`btn modal-button text-normal font-medium normal-case ${disabledClass} ${outlinedClass}`}
        onClick={action2}
      >
        {action1}
        {svg}
      </label>
      <input type="checkbox" id={name} className="modal-toggle" />
      <div className="modal">
        <div className={`pt-10 modal-box ${larger}`}>
          <label htmlFor={name} className="absolute btn btn-sm btn-outline btn-square right-2 top-2">
            {x}
          </label>
          {children}
          <div className="modal-action">{buttons}</div>
        </div>
      </div>
    </>
  );
}

export default Popup;
