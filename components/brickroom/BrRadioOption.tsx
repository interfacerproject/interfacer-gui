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

import classNames from "classnames";
import { forwardRef } from "react";
import { TestProp } from "./types";

//

export interface BrRadioOptionProps extends TestProp {
  id: string;
  label: string;
  name: string;
  value: string;
  description?: string;
}

//

const BrRadioOption = forwardRef<HTMLInputElement, BrRadioOptionProps>((props, ref) => {
  const { name, label, description, id, value, testID, ...other } = props;
  // `...other` is needed to pass extra props to the input element
  // for example, 'react-hook-form' has to pass {...register("name")}

  const classes = classNames({
    // Base styles
    "flex flex-row items-center space-x-3 p-4 border-1 rounded-md": true,
    // Not checked
    "hover:bg-gray-200 hover:cursor-pointer border-gray-300": true,
    // Checked /* TODO */
    // "border-green-600 bg-green-100": checked,
  });

  return (
    <label htmlFor={id} className={classes} data-test={testID}>
      <input type="radio" name={name} id={id} ref={ref} value={value} {...other} />
      <div>
        <p className="font-bold">{label}</p>
        {description && <p className="text-gray-500">{description}</p>}
      </div>
    </label>
  );
});

//

BrRadioOption.displayName = "BrRadioOption";
export default BrRadioOption;
