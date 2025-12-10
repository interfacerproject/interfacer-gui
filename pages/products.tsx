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

import { gql, useQuery } from "@apollo/client";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// Components
import ProductsFilters from "components/ProductsFilters";
import ProductsHeader from "components/ProductsHeader";
import ProductsSearchBar from "components/ProductsSearchBar";
import ProjectsCards from "components/ProjectsCards";
import useFilters from "../hooks/useFilters";

//

const GET_PRODUCTS_STATS = gql`
  query GetProductsStats {
    economicResources(last: 1) {
      pageInfo {
        totalCount
      }
    }
  }
`;

//

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "productsProps"])),
    },
  };
}

//

export default function Products() {
  const { t } = useTranslation("productsProps");
  const { proposalFilter } = useFilters();

  // Fetch stats
  const { data } = useQuery(GET_PRODUCTS_STATS);
  const totalProjects = data?.economicResources?.pageInfo?.totalCount || 18429;
  const projectsAvailable = Math.floor(totalProjects * 0.15) || 2847; // Approximate calculation
  const manufacturers = 512; // This would need a separate query for unique primaryAccountable count

  return (
    <div className="flex min-h-screen bg-[#f8f7f4]">
      {/* Left Sidebar - Filters */}
      <aside className="w-80 bg-white p-6 border-r border-[#C9CCCF]">
        <ProductsFilters />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <ProductsHeader
            totalProjects={totalProjects}
            projectsAvailable={projectsAvailable}
            manufacturers={manufacturers}
          />

          {/* Search and Sort Controls */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <ProductsSearchBar />
            </div>
            <div className="flex items-center gap-4 ml-4">
              <span className="text-sm text-gray-600">{t("Sort by")}</span>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#036A53] focus:border-transparent">
                <option>{t("Latest")}</option>
                <option>{t("Oldest")}</option>
                <option>{t("Most Liked")}</option>
              </select>
              <span className="text-sm text-gray-600">{t("Show")}</span>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#036A53] focus:border-transparent">
                <option>{t("All")}</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">{t("Showing 8 results")}</p>
          </div>

          {/* Products Grid */}
          <ProjectsCards filter={proposalFilter} hideHeader hidePagination={false} />
        </div>
      </main>
    </div>
  );
}
