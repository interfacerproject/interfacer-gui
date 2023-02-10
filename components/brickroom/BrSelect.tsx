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

type BrSelectProps = {
  array: Array<{ id: string; name: string }>;
  placeholder?: string;
  label?: string;
  value?: string | Array<string>;
  handleSelect: ChangeEventHandler;
  hint?: string;
  error?: string;
  className?: string;
  roundedLG?: boolean;
  multiple?: boolean;
};

const BrSelect = (props: BrSelectProps) => {
  const selectClass = props.roundedLG ? "select select-bordered rounded-full" : "select select-bordered";

  return (
    <>
      <div className={`form-control ${props.className}`}>
        <label className="label">
          <h4 className="label-text capitalize">{props.label}</h4>
        </label>
        <select
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => props.handleSelect(e)}
          className={selectClass}
          value={props.value}
          multiple={props.multiple}
        >
          {props.placeholder && (
            <option disabled selected className="disabled" value="">
              {props.placeholder}
            </option>
          )}
          {props.array?.map((unit: { id: string; name: string }) => (
            <option key={unit?.id} value={unit?.id}>
              {unit?.name}
            </option>
          ))}
        </select>
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

export default BrSelect;
