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

import cn from "classnames";
import { ReactElement, useState } from "react";
type TabsProps = Array<{
  title: ReactElement | string;
  component: ReactElement<any, any>;
  disabled?: boolean;
}>;

const BrTabs = ({ tabsArray, initialTab = 0 }: { tabsArray: TabsProps; initialTab?: number }) => {
  const [tab, setTab] = useState(initialTab);

  return (
    <>
      <div className="tabs text-primary">
        {tabsArray.map((t, i) => (
          <a
            key={i}
            className={cn("tab tab-bordered pb-9", {
              "tab-active text-primary": i === tab,
              "tab-disabled": tabsArray[i].disabled,
            })}
            onClick={() => setTab(i)}
          >
            {t.title}
          </a>
        ))}
      </div>
      <div>{tabsArray[tab].component}</div>
    </>
  );
};
export default BrTabs;
