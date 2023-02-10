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

import React, { ChangeEventHandler } from "react";
import BrFieldInfo, { BrFieldInfoProps } from "./BrFieldInfo";

//

interface BrInputProps extends BrFieldInfoProps {
  type?: "number" | "text" | "password" | "date" | "email";
  name: string;
  value?: string | number;
  placeholder?: string;
  onChange?: ChangeEventHandler;
  onBlur?: ChangeEventHandler;
  testID?: string;
}

//

const BrInput = React.forwardRef<HTMLInputElement, BrInputProps>((props, ref) => {
  const { type = "text" } = props;

  return (
    <BrFieldInfo {...props} for={props.name}>
      <input
        className="w-full rounded-md input input-bordered focus:input-primary"
        type={type}
        name={props.name}
        value={props.value}
        placeholder={props.placeholder}
        onChange={props.onChange}
        onBlur={props.onBlur}
        ref={ref}
        data-test={props.testID}
      />
    </BrFieldInfo>
  );
});

//

BrInput.displayName = "BrInput";
export default BrInput;
