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

import { BellIcon } from "@heroicons/react/outline";
import Link from "next/link";
import useInBox from "../hooks/useInBox";

const NotificationBell = () => {
  const { countUnread, hasNewMessages } = useInBox();
  return (
    <Link href="/notification">
      <a className="relative mr-4" id="notification-bell">
        <button className="bg-white btn btn-circle btn-accent">
          <BellIcon className={`w-5 h-5 ${hasNewMessages ? "animate-swing origin-top" : ""}`} />
        </button>
        {countUnread > 0 && (
          <sup className="absolute top-0 right-0 btn btn-active btn-circle btn-success btn-xs">{countUnread}</sup>
        )}
      </a>
    </Link>
  );
};

export default NotificationBell;
