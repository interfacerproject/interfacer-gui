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

import Link from "next/link";

const BrTags = ({ tags }: { tags?: Array<string>; onCancel?: (tag: string) => void; testID?: string }) => {
  return (
    <>
      <div className="w-full space-x-1">
        {tags && tags.length > 0 && (
          <>
            {tags?.map((tag: string, index) => (
              <Link href={`/projects?tags=${tag}`} key={index}>
                <a
                  key={tag}
                  className={`text-primary bg-[#E1EFEC] hover:bg-[#CDE4DF] border border-1 border-[#CDE4DF] rounded-[4px] text-sm float-left mb-1 mr-1 p-1.5`}
                >
                  {decodeURI(tag)}
                </a>
              </Link>
            ))}
          </>
        )}
      </div>
    </>
  );
};
export default BrTags;
