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

import { LocationMarkerIcon } from "@heroicons/react/solid";
import { PersonWithFileEssential } from "lib/types/extensions";
import Link from "next/link";
import BrUserAvatar from "./BrUserAvatar";

type BrDisplayUserProps = {
  user: Partial<PersonWithFileEssential>;
};

const BrDisplayUser = (props: BrDisplayUserProps) => {
  const { user } = props;
  if (!user) return null;
  const location = user.primaryLocation;

  return (
    <Link href={`/profile/${user.id}`}>
      <a className="flex items-center pl-0">
        <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
          <div className="w-12 rounded-full">
            <BrUserAvatar user={user} size="48px"></BrUserAvatar>
          </div>
        </label>
        <div className="ml-4">
          <h4 className="flex-auto">{user.name}</h4>
          {location && (
            <span className="flex items-center text-primary">
              <LocationMarkerIcon className="w-4 h-4 mr-1" />
              {location.mappableAddress}
            </span>
          )}
        </div>
      </a>
    </Link>
  );
};
export default BrDisplayUser;
