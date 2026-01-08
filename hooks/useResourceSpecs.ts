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
import { QUERY_ALL_RESOURCE_SPECS, QUERY_PROJECT_TYPES } from "lib/QueryAndMutation";
import { GetProjectTypesQuery } from "lib/types";

interface ResourceSpec {
  id: string;
  name: string;
}

interface AllResourceSpecsQuery {
  resourceSpecifications: {
    edges: Array<{
      node: ResourceSpec;
    }>;
  };
}

/**
 * Hook to get all ResourceSpecification IDs including DPP, Machine, Material
 *
 * WORKAROUND: The backend seeds specDpp, specMachine, specMaterial but doesn't
 * expose them via instanceVariables yet. This hook queries resourceSpecifications
 * directly and finds specs by name as a fallback.
 *
 * Once backend exposes these via instanceVariables, this hook can be simplified.
 */
export const useResourceSpecs = () => {
  // Try to get specs from instanceVariables first
  const { data: instanceData, loading: instanceLoading } = useQuery<GetProjectTypesQuery>(QUERY_PROJECT_TYPES);

  // Fallback: query all resourceSpecifications and find by name
  const { data: allSpecsData, loading: allSpecsLoading } = useQuery<AllResourceSpecsQuery>(QUERY_ALL_RESOURCE_SPECS);

  const instanceSpecs = instanceData?.instanceVariables?.specs;
  const allSpecs = allSpecsData?.resourceSpecifications?.edges?.map(e => e.node) || [];

  // Helper to find spec by name from allSpecs
  const findSpecByName = (name: string): ResourceSpec | undefined => {
    return allSpecs.find(s => s.name.toLowerCase() === name.toLowerCase());
  };

  // Project types - try instanceVariables first, fallback to query by name
  const specProjectDesign = instanceSpecs?.specProjectDesign || findSpecByName("Design");
  const specProjectProduct = instanceSpecs?.specProjectProduct || findSpecByName("Product");
  const specProjectService = instanceSpecs?.specProjectService || findSpecByName("Service");

  // DPP, Machine, Material - try instanceVariables first, fallback to query by name
  const specDpp = instanceSpecs?.specDpp || findSpecByName("DPP");
  const specMachine = instanceSpecs?.specMachine || findSpecByName("Machine");
  const specMaterial = instanceSpecs?.specMaterial || findSpecByName("Material");

  const loading = instanceLoading || allSpecsLoading;

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
