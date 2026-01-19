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
import { useRouter } from "next/router";
import React from "react";

// Components
import ProductsActiveFiltersBar from "components/ProductsActiveFiltersBar";
import ProductsCategoriesBar from "components/ProductsCategoriesBar";
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

const Products = () => {
  const { t } = useTranslation("productsProps");
  const router = useRouter();
  const { proposalFilter } = useFilters();
  const [resultsCount, setResultsCount] = React.useState<number>(0);
  const [resultsLoading, setResultsLoading] = React.useState<boolean>(true);
  const [showMobileFilters, setShowMobileFilters] = React.useState<boolean>(false);

  // Fetch stats
  const { data: statsData, loading: statsLoading } = useQuery(GET_PRODUCTS_STATS);
  const totalProjects = statsData?.economicResources?.pageInfo?.totalCount || 0;

  // Sort and show controls
  const sortBy = (router.query.sort as string) || "latest";
  const showFilter = (router.query.show as string) || "all";

  const handleSortChange = (value: string) => {
    const query = { ...router.query, sort: value };
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  const handleShowChange = (value: string) => {
    const query = { ...router.query };
    if (value === "all") {
      delete query.show;
    } else {
      query.show = value;
    }
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  const clearFilters = () => {
    router.push({ pathname: router.pathname }, undefined, { shallow: true });
  };

  const hasActiveFilters = Object.keys(router.query).length > 0;

  // Custom empty state for filtered results
  const filteredEmptyState = (
    <div className="bg-white rounded-lg p-12 text-center">
      <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        />
      </svg>
      <h3 className="text-xl font-semibold text-gray-900 mb-2" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
        {t("No projects match your filters")}
      </h3>
      <p className="text-gray-600 mb-6" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
        {hasActiveFilters
          ? t("Try adjusting your search or removing some filters to see more results")
          : t("No projects available at the moment")}
      </p>
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#036A53] hover:bg-[#025845] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#036A53]"
          style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
        >
          {t("Clear all filters")}
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8f7f4]">
      {/* Mobile Filter Button */}
      <button
        onClick={() => setShowMobileFilters(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 bg-[#036A53] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-[#025845]"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        {t("Filters")}
      </button>

      {/* Desktop Sidebar - Filters */}
      <aside className="hidden lg:block w-80 bg-white p-6 border-r border-[#C9CCCF]">
        <ProductsFilters />
      </aside>

      {/* Mobile Drawer - Filters */}
      {showMobileFilters && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowMobileFilters(false)}
          />
          {/* Drawer */}
          <aside className="lg:hidden fixed inset-y-0 left-0 w-80 bg-white p-6 z-50 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                {t("Filters")}
              </h2>
              <button onClick={() => setShowMobileFilters(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ProductsFilters />
          </aside>
        </>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <ProductsHeader totalProjects={totalProjects} loading={statsLoading} filteredCount={resultsCount} />

          {/* Categories */}
          <ProductsCategoriesBar />

          {/* Active Filters */}
          <ProductsActiveFiltersBar />

          {/* Search and Sort Controls */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex-1 max-w-2xl">
              <ProductsSearchBar />
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <span className="text-sm text-gray-600 hidden md:inline">{t("Sort by")}</span>
              <select
                value={sortBy}
                onChange={e => handleSortChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#036A53] focus:border-transparent text-sm"
              >
                <option value="latest">{t("Latest")}</option>
                <option value="oldest">{t("Oldest")}</option>
                <option value="mostLiked">{t("Most Liked")}</option>
              </select>
              <span className="text-sm text-gray-600 hidden md:inline">{t("Show")}</span>
              <select
                value={showFilter}
                onChange={e => handleShowChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#036A53] focus:border-transparent text-sm"
              >
                <option value="all">{t("All")}</option>
                <option value="designs">{t("Designs")}</option>
                <option value="products">{t("Products")}</option>
                <option value="services">{t("Services")}</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-4">
            {resultsLoading ? (
              <p className="text-sm text-gray-600">{t("Loading...")}</p>
            ) : (
              <p className="text-sm text-gray-600">{t("Showing {{count}} results", { count: resultsCount })}</p>
            )}
          </div>

          {/* Products Grid */}
          <ProjectsCards
            filter={proposalFilter}
            hideHeader
            hidePagination={false}
            emptyState={filteredEmptyState}
            onDataLoaded={({ totalCount, loading }) => {
              setResultsCount(totalCount);
              setResultsLoading(loading);
            }}
          />
        </div>
      </main>
    </div>
  );
};

Products.publicPage = true;

export default Products;
