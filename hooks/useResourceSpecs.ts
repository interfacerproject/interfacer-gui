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
import { GetProjectTypesQuery } from "lib/types";

/**
 * Hook to get all ResourceSpecification IDs including DPP, Machine, Material
 *
 * Gets specs from backend instanceVariables which now exposes all required specs:
 * specProjectDesign, specProjectProduct, specProjectService, specDpp, specMachine, specMaterial
 */
export const useResourceSpecs = () => {
  const { data: instanceData, loading } = useQuery<GetProjectTypesQuery>(QUERY_PROJECT_TYPES);

  const specs = instanceData?.instanceVariables?.specs;

  // Extract individual specs
  const specProjectDesign = specs?.specProjectDesign;
  const specProjectProduct = specs?.specProjectProduct;
  const specProjectService = specs?.specProjectService;
  const specDpp = specs?.specDpp;
  const specMachine = specs?.specMachine;
  const specMaterial = specs?.specMaterial;

  // Check if we have all required specs
  const hasProjectSpecs = !!(specProjectDesign && specProjectProduct && specProjectService);
  const hasAllSpecs = hasProjectSpecs && !!(specDpp && specMachine && specMaterial);

  return {
    // Individual specs
    specProjectDesign,
    specProjectProduct,
    specProjectService,
    specDpp,
    specMachine,
    specMaterial,

    // Convenience arrays
    projectSpecIds: hasProjectSpecs
      ? [
          specProjectDesign!.id,
          specProjectProduct!.id,
          specProjectService!.id,
          ...(specMachine ? [specMachine.id] : []),
        ]
      : [],

    // Loading state
    loading,
    hasProjectSpecs,
    hasAllSpecs,
  };
};
