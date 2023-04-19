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
import Link from "next/link";
import { LocationMarkerIcon } from "@heroicons/react/solid";

type BrDisplayUserProps = {
  id: string;
  name?: string;
  location?: string;
};

const BrDisplayUser = (props: BrDisplayUserProps) => {
  return (
    <Link href={`/profile/${props.id}`}>
      <a className="flex items-center pl-0">
        <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
          <div className="w-12 rounded-full">
            <Avatar
              size={"full"}
              name={props.name}
              variant="beam"
              colors={["#F1BD4D", "#D8A946", "#02604B", "#F3F3F3", "#014837"]}
            />
          </div>
        </label>
        <div className="ml-4">
          <h4 className="flex-auto">{props.name}</h4>
          {props.location && (
            <span className="flex items-center text-primary">
              <LocationMarkerIcon className="w-4 h-4 mr-1" />
              {props.location}
            </span>
          )}
        </div>
      </a>
    </Link>
  );
};
export default BrDisplayUser;
