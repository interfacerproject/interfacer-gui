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

import BrSelect from "./brickroom/BrSelect";
import { useRouter } from "next/router";

const LocationMenu = ({ className }: { className?: string }) => {
  const router = useRouter();
  const { pathname, asPath, query, locale } = router;
  const handleSelect = (e: any) => {
    e.preventDefault();
    router.push({ pathname, query }, asPath, { locale: e.target.value });
  };
  return (
    <BrSelect
      className={className}
      array={[
        { id: "en", name: "en" },
        { id: "de", name: "de" },
        { id: "fr", name: "fr" },
        { id: "it", name: "it" },
      ]}
      handleSelect={handleSelect}
      value={locale}
      roundedLG
    />
  );
};
export default LocationMenu;
