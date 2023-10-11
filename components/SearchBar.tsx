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

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React, { useState } from "react";

const SearchBar = () => {
  const router = useRouter();
  const { q } = useRouter().query;
  const [searchString, setSearchString] = useState(q || "");
  const { t } = useTranslation("common");
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      router.push(`/search?q=${searchString}`);
    }
  };

  return (
    <>
      <input
        type="text"
        placeholder={t("search") + "..."}
        className="p-3 rounded-xl input-bordered w-128 outline-offset-1 outline-primary"
        onKeyDown={handleKeyDown}
        onChange={e => setSearchString(e.target.value)}
      />
    </>
  );
};

export default SearchBar;
