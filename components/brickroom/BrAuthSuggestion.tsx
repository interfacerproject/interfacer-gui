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

import { LinkIcon } from "@heroicons/react/outline";
import Link from "next/link";

//

export interface BrAuthSuggestionProps {
  baseText: string;
  linkText: string;
  url: string;
}

//

export default function BrAuthSuggestion(props: BrAuthSuggestionProps) {
  const { baseText, linkText, url } = props;

  return (
    <div className="flex flex-row justify-between items-baseline">
      {/* The text */}
      <p>{baseText}</p>

      {/* The link */}
      <p>
        <Link href={url}>
          <a className="flex flex-row font-semibold items-baseline">
            <LinkIcon className="w-5 h-5 mr-1 self-center" />
            {linkText}
          </a>
        </Link>
      </p>
    </div>
  );
}
