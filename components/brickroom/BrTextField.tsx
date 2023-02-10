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
import { ExclamationIcon } from "@heroicons/react/solid";

type BrTextFieldProps = {
  placeholder?: string;
  label?: string;
  onChange?: ChangeEventHandler;
  hint?: string;
  error?: string;
  value?: string;
  onBlur?: ChangeEventHandler;
  testID?: string;
};

const BrTextField = (props: BrTextFieldProps) => {
  return (
    <>
      <div className="w-full form-control">
        <label className="label">
          <span className="label-text">{props.label}</span>
        </label>
        <textarea
          placeholder={props.placeholder}
          onChange={props.onChange}
          className="w-full textarea textarea-bordered focus:textarea-primary"
          value={props.value}
          onBlur={props.onBlur}
          data-test={props.testID}
        />
        <label className="label">
          {props.error && (
            <span className="flex flex-row items-center justify-between label-text-alt text-warning">
              <ExclamationIcon className="w-5 h-5" />
              {props.error}
            </span>
          )}
          {props.hint && <span className="label-text-alt">{props.hint}</span>}
        </label>
      </div>
    </>
  );
};

export default BrTextField;
