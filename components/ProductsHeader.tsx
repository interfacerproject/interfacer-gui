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
  projectsAvailable?: number;
  manufacturers?: number;
}

export default function ProductsHeader(props: ProductsHeaderProps) {
  const { totalProjects = 0, projectsAvailable = 0, manufacturers = 0 } = props;
  const { t } = useTranslation("productsProps");

  return (
    <div className="mb-8">
      {/* Badge */}
      <div className="mb-4">
        <span className="inline-block px-3 py-1 text-sm font-medium text-[#036A53] bg-[#E1EFEC] rounded">
          {t("Interfacer")}
        </span>
      </div>

      {/* Title and Description */}
      <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {t("Browse OSH Designs")}
      </h1>
      <p className="text-lg text-gray-600 mb-6" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
        {t("Discover forks and contribute to open source projects from local and global makers")}
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                {totalProjects.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                {t("Total Projects")}
              </div>
            </div>
          </div>
        </div>

        {/* Projects Available */}
        <div
          className="bg-white p-4 rounded-lg"
          style={{ boxShadow: "0 1px 2px 0 rgba(16, 24, 40, 0.06), 0 1px 3px 0 rgba(16, 24, 40, 0.10)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFF5EA] rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#F1BD4D]" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                {projectsAvailable.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                {t("Projects available")}
              </div>
            </div>
          </div>
        </div>

        {/* Manufacturers */}
        <div
          className="bg-white p-4 rounded-lg"
          style={{ boxShadow: "0 1px 2px 0 rgba(16, 24, 40, 0.06), 0 1px 3px 0 rgba(16, 24, 40, 0.10)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                {manufacturers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                {t("Manufacturers")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
