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
 * Hook to get project type ResourceSpecification IDs
 * Returns an array of spec IDs for DESIGN, SERVICE, PRODUCT projects
 * Useful for filtering queries to show only projects (exclude DPP, machines as resources, etc.)
 *
 * TODO: Add specProjectMachine once backend supports it
 */
export const useProjectSpecs = () => {
  const { data, loading } = useQuery<GetProjectTypesQuery>(QUERY_PROJECT_TYPES);
  const specs = data?.instanceVariables.specs;

  const projectSpecIds = specs
    ? [
        specs.specProjectDesign.id,
        specs.specProjectService.id,
        specs.specProjectProduct.id,
        // TODO: Add specs.specProjectMachine.id once backend adds it
      ]
    : [];

  return { projectSpecIds, loading };
};
