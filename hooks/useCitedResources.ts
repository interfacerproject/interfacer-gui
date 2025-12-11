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
import { QUERY_CITED_RESOURCES } from "lib/QueryAndMutation";
import { RESOURCE_SPEC_DPP, RESOURCE_SPEC_MACHINE } from "lib/resourceSpecs";
import { EconomicResource } from "lib/types";

interface CitedResourcesData {
  economicEvents: {
    edges: Array<{
      node: {
        id: string;
        resourceInventoriedAs: EconomicResource;
      };
    }>;
  };
}

/**
 * Hook to fetch and parse cited resources (DPP and machines) from a project
 * @param processId - The process ID associated with the project
 * @returns Object containing dppResource, machines array, and loading state
 */
export const useCitedResources = (processId?: string) => {
  const { data, loading, error } = useQuery<CitedResourcesData>(QUERY_CITED_RESOURCES, {
    variables: { processId },
    skip: !processId,
  });

  const citedResources = data?.economicEvents?.edges?.map(edge => edge.node.resourceInventoriedAs) || [];

  // Find DPP resource
  const dppResource = citedResources.find(resource => resource.conformsTo?.id === RESOURCE_SPEC_DPP);

  // Find machine resources
  const machines = citedResources.filter(resource => resource.conformsTo?.id === RESOURCE_SPEC_MACHINE);

  // Extract DPP service ULID from metadata
  let dppServiceUlid: string | undefined;
  if (dppResource?.metadata) {
    try {
      const metadata = JSON.parse(dppResource.metadata);
      dppServiceUlid = metadata.dppServiceUlid;
    } catch (e) {
      console.error("Failed to parse DPP metadata:", e);
    }
  }

  return {
    dppResource,
    dppServiceUlid,
    machines,
    loading,
    error,
  };
};
