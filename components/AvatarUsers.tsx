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

import React from "react";
import Link from "next/link";
import Avatar from "boring-avatars";

const AvatarUsers = ({ users }: { users: Array<{ name: string; id: string }> }) => {
  return (
    <div className="avatar-group -space-x-6 h-20 w-32">
      {users?.map((u, i) => (
        <>
          {i < 4 && (
            <Link key={u?.id} href={`/profile/${u?.id}`}>
              <a>
                <div className="avatar">
                  <div className="w-9 hover:w-14">
                    <Avatar
                      size={"full"}
                      name={u.name}
                      variant="beam"
                      colors={["#F1BD4D", "#D8A946", "#02604B", "#F3F3F3", "#014837"]}
                    />
                  </div>
                </div>
              </a>
            </Link>
          )}
        </>
      ))}
    </div>
  );
};
export default AvatarUsers;
