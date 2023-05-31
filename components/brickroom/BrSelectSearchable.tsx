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

import { SelectOptions } from "components/brickroom/utils/BrSelectUtils";
import PFieldInfo, { PFieldInfoProps } from "components/polaris/PFieldInfo";
import { forwardRef } from "react";
import Select, { Props } from "react-select";
import CreatableSelect from "react-select/creatable";

//

export interface BrSelectSearchableProps extends Props, PFieldInfoProps {
  creatable?: boolean;
  defaultValueRaw?: Array<any>;
  id?: string;
}

//

const BrSelectSearchable = forwardRef<any, BrSelectSearchableProps>((props, ref) => {
  const { creatable = false, defaultValueRaw, id } = props;

  /**
   * Important explanation:
   *
   * - Values are passed to react-select as "{label, value}"
   * - If I (bbtgnn) understood correctly,
   *   To pass default values, one should have to pass explicitly {label, value}
   * - But this is too complex
   *
   * So this is my solution:
   * - props.defaultValueRaw is an Array of just {value}
   * - the next part filters the options array by the values
   * - Thus creating the defaultValue array of {label, value}
   */
  let defaultValue: SelectOptions<any> = [];
  if (defaultValueRaw && props.options) {
    defaultValue = (props.options as SelectOptions<any>).filter(o => defaultValueRaw.includes(o.value));
  }

  return (
    <PFieldInfo {...props}>
      {!creatable && (
        <Select
          defaultValue={defaultValue}
          {...props}
          ref={ref}
          id={id}
          menuPortalTarget={document.body}
          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
        />
      )}
      {creatable && (
        <CreatableSelect
          defaultValue={defaultValue}
          {...props}
          ref={ref}
          menuPortalTarget={document.body}
          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
          id={id}
        />
      )}
    </PFieldInfo>
  );
});

//

BrSelectSearchable.displayName = "BrSelectSearchable";
export default BrSelectSearchable;

//
