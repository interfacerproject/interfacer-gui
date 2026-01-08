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

export interface ProductsHeaderProps {
  totalProjects?: number;
  filteredCount?: number;
  loading?: boolean;
}

export default function ProductsHeader(props: ProductsHeaderProps) {
  const { totalProjects = 0, filteredCount = 0, loading = false } = props;
  const { t } = useTranslation("productsProps");

  return (
    <div className="mb-6 md:mb-8">
      {/* Badge */}
      <div className="mb-3 md:mb-4">
        <span className="inline-block px-3 py-1 text-sm font-medium text-[#036A53] bg-[#E1EFEC] rounded">
          {t("Interfacer")}
        </span>
      </div>

      {/* Title and Description */}
      <h1
        className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {t("Browse OSH Designs")}
      </h1>
      <p
        className="text-base md:text-lg text-gray-600 mb-4 md:mb-6"
        style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
      >
        {t("Discover forks and contribute to open source projects from local and global makers")}
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {/* Total Projects */}
        <div
          className="bg-white p-4 rounded-lg"
          style={{ boxShadow: "0 1px 2px 0 rgba(16, 24, 40, 0.06), 0 1px 3px 0 rgba(16, 24, 40, 0.10)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E1EFEC] rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#036A53]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                {loading ? "—" : totalProjects.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                {t("Total Projects")}
              </div>
            </div>
          </div>
        </div>

        {/* Filtered Results */}
        <div
          className="bg-white p-4 rounded-lg"
          style={{ boxShadow: "0 1px 2px 0 rgba(16, 24, 40, 0.06), 0 1px 3px 0 rgba(16, 24, 40, 0.10)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFF5EA] rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#F1BD4D]" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                {loading ? "—" : filteredCount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                {t("Filtered Results")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
