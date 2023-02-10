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

import { HtmlForProp as HP } from "./types";

export interface PHelpProps extends HP {
  helpText?: string;
}

export default function PHelp({ helpText, htmlFor }: PHelpProps) {
  return (
    <div className="Polaris-Labelled__HelpText" id={`${htmlFor}HelpText`}>
      <span className="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--break Polaris-Text--subdued">
        {helpText}
      </span>
    </div>
  );
}
