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

import Avatar from "boring-avatars";
import { useTranslation } from "next-i18next";
import Link from "next/link";

const AvatarUsers = ({ users, size = 4 }: { users: Array<string>; size?: number }) => {
  const length = users.length;
  const overflow = length > size;
  const cut = overflow ? users.slice(0, length) : users;
  const { t } = useTranslation("common");

  return (
    <div className="flex">
      <div className="avatar-group -space-x-4 h-11">
        {cut?.map((u, i) => (
          <Link key={u} href={`/profile/${u}`}>
            <a>
              <div className="avatar">
                <div className="w-9">
                  <Avatar name={u} variant="beam" colors={["#F1BD4D", "#D8A946", "#02604B", "#F3F3F3", "#014837"]} />
                </div>
              </div>
            </a>
          </Link>
        ))}
      </div>
      {overflow && (
        <div className="-ml-4 z-50 w-10 h-10 rounded-full bg-base-200 grid place-items-center">
          <span>
            {t("+")} {length - size}
          </span>
        </div>
      )}
    </div>
  );
};
export default AvatarUsers;
