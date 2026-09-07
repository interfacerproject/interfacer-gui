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

import { ChildrenComponent as CC } from "components/brickroom/types";

export interface SeedBoxProps {}

/** The passphrase itself, in the form-input well the prototype uses for fields. */
export default function SeedBox(props: CC<SeedBoxProps>) {
  return (
    <span
      className="block rounded-ifr-md border border-ifr-form-input bg-ifr-form-input p-4 font-mono text-[16px] leading-[24px] text-ifr-text-primary shadow-ifr-sm"
      data-test="passphrase"
    >
      {props.children}
    </span>
  );
}
