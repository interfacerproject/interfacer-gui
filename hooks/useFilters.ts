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

import { useQuery } from "@apollo/client";
import { QUERY_PROJECT_TYPES } from "lib/QueryAndMutation";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { EconomicResourceFilterParams, GetProjectTypesQuery } from "../lib/types";

const useFilters = () => {
  const { conformsTo, primaryAccountable, tags, q, location, show } = useRouter().query;
  const { t } = useTranslation("lastUpdatedProps");

  const tagsList = typeof tags === "string" ? tags.split(",") : tags;
  const primaryAccountableList =
    typeof primaryAccountable === "string" ? primaryAccountable.split(",") : primaryAccountable;
  const conformToList = typeof conformsTo === "string" ? conformsTo.split(",") : conformsTo;
  const searchQuery = typeof q === "string" ? q : undefined;
  const locationQuery = typeof location === "string" ? location : undefined;
  const showFilter = typeof show === "string" ? show : undefined;

  const queryProjectTypes = useQuery<GetProjectTypesQuery>(QUERY_PROJECT_TYPES);
  const specs = queryProjectTypes.data?.instanceVariables.specs;
  const specsLoading = queryProjectTypes.loading;
  const coformsToIds = {
    service: specs?.specProjectService.id,
    product: specs?.specProjectProduct.id,
    design: specs?.specProjectDesign.id,
  };
  const conformsToNoDesign = specs ? [specs.specProjectService.id, specs.specProjectProduct.id] : undefined;

  // Map show filter to conformsTo IDs
  // Returns undefined if specs not loaded to prevent empty array being sent
  const getShowFilterConformsTo = (): string[] | undefined => {
    if (!specs) return undefined; // Don't return empty array - backend requires at least 1 item
    if (!showFilter || showFilter === "all") return conformToList;

    const filterMap: Record<string, string> = {
      designs: specs.specProjectDesign.id,
      products: specs.specProjectProduct.id,
      services: specs.specProjectService.id,
    };

    const filterId = filterMap[showFilter];
    // Replace conformToList with the specific filter when show filter is active
    return filterId ? [filterId] : conformToList;
  };

  const showFilterConformsTo = getShowFilterConformsTo();

  const resourceFilter: EconomicResourceFilterParams = {
    primaryAccountable: [process.env.NEXT_PUBLIC_LOSH_ID!],
    gtOnhandQuantityHasNumericalValue: 0,
    conformsTo: showFilterConformsTo,
    classifiedAs: tagsList?.map(tag => encodeURI(tag)),
  };
  const proposalFilter: EconomicResourceFilterParams = {
    conformsTo: showFilterConformsTo,
    primaryAccountable: primaryAccountableList,
    classifiedAs: tagsList?.map(tag => encodeURI(tag)),
    notCustodian: [process.env.NEXT_PUBLIC_LOSH_ID!],
    ...(searchQuery && { orName: searchQuery }),
    ...(locationQuery && { orNote: locationQuery }), // Using note field as workaround for location search
  };
  const mapFilter: Partial<EconomicResourceFilterParams> = {
    conformsTo: conformsToNoDesign,
    classifiedAs: tagsList?.map(tag => encodeURI(tag)),
    primaryAccountable: primaryAccountableList,
  };

  return {
    proposalFilter,
    resourceFilter,
    mapFilter,
    serviceId: coformsToIds.service,
    productId: coformsToIds.product,
    designId: coformsToIds.design,
    specsLoading,
  };
};

export type UseFiltersReturnsValue = ReturnType<typeof useFilters>;

export default useFilters;
