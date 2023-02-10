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

import BrFieldError from "./BrFieldError";
import { ChildrenComponent, TestProp } from "./types";

export interface BrFieldInfoProps extends TestProp {
  for?: string;
  label?: string;
  hint?: string;
  error?: string | any;
  help?: string;
}

export default function BrFieldInfo(props: ChildrenComponent<BrFieldInfoProps>) {
  const { hint, help, error, testID = "info" } = props;

  // Building test-ids
  const wrapperID = `${testID}-wrapper`;
  const labelID = `${testID}-label`;
  const errorID = `${testID}-error`;
  const hintID = `${testID}-hint`;
  const helpID = `${testID}-help`;

  return (
    <div className="flex flex-col items-stretch justify-start space-y-2" data-test={wrapperID}>
      {/* Label */}
      {props.label && (
        <label className="" htmlFor={props.for} data-test={labelID}>
          <h4 className="label-text">{props.label}</h4>
        </label>
      )}

      {/* Slot for content */}
      {props.children}

      {/* Info under field */}
      {(error || hint || help) && (
        <label htmlFor={props.for} className="space-y-2">
          {/* Hints */}
          {hint && (
            <span className="label-text-alt" data-test={hintID}>
              {hint}
            </span>
          )}

          {/* Help */}
          {help && (
            <p className="text-[#8A8E96]" data-test={helpID}>
              {help}
            </p>
          )}

          {/* Error */}
          {error && <BrFieldError testID={errorID} message={error} />}
        </label>
      )}
    </div>
  );
}
