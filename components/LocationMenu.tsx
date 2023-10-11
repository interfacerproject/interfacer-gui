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

import { Text } from "@bbtgnn/polaris-interfacer";
import { useRouter } from "next/router";
import { ChildrenProp } from "./brickroom/types";
import TopbarPopover from "./partials/topbar/TopbarPopover";

const LocationMenu = ({ className }: { className?: string }) => {
  const router = useRouter();
  const { pathname, asPath, query, locale } = router;
  const handleSelect = (loc: string) => {
    router.push({ pathname, query }, asPath, { locale: loc });
  };
  //locales with flag
  const locales = [
    { label: "en", flag: "🇬🇧" },
    { label: "fr", flag: "🇫🇷" },
    { label: "it", flag: "🇮🇹" },
    { label: "de", flag: "🇩🇪" },
  ];

  return (
    <TopbarPopover
      id="user-menu"
      buttonContent={
        <Text as="p" variant="headingXl">
          {locales.find(l => l.label === locale)?.flag}
        </Text>
      }
    >
      <div className="divide-y-1 divide-slate-200">
        <div>
          {locales.map(loc => (
            <MenuLink onclick={() => handleSelect(loc.label)} key={loc.label}>
              <Text as="p" variant="headingXl">
                {loc.flag}
              </Text>
            </MenuLink>
          ))}
        </div>
      </div>
    </TopbarPopover>
  );
};
export default LocationMenu;

function MenuLink(props: { onclick: () => void } & ChildrenProp) {
  const { onclick, children } = props;
  return (
    <button onClick={onclick} className="block w-full">
      <a>
        <div className="hover:bg-slate-100 py-2 px-3">
          <div className="">{children}</div>
        </div>
      </a>
    </button>
  );
}
