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

import { getInstanceVariables, type InstanceVariables } from "@dyne/interfacer-client";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

/**
 * Fetch resource specification IDs from the Zenflows instance.
 *
 * Before SDK migration, this used Apollo's useQuery directly.
 * Now it calls the SDK's getInstanceVariables() which queries
 * the Zenflows GraphQL endpoint and caches the result.
 *
 * Returns stable empty values initially, then populates once
 * the data arrives from the server.
 */
export const useResourceSpecs = () => {
  const { client } = useAuth();
  const [vars, setVars] = useState<InstanceVariables | null>(null);

  useEffect(() => {
    if (!client) return;
    getInstanceVariables(client.graphql)
      .then(setVars)
      .catch(() => setVars(null));
  }, [client]);

  const specProjectDesign = vars?.projectDesign ?? { id: "", name: "" };
  const specProjectProduct = vars?.projectProduct ?? { id: "", name: "" };
  const specProjectService = vars?.projectService ?? { id: "", name: "" };
  const specDpp = vars?.dpp ?? { id: "", name: "" };
  const specMachine = vars?.machine ?? { id: "", name: "" };
  const specMaterial = vars?.material ?? { id: "", name: "" };

  const hasAllSpecs = !!(specProjectDesign.id && specProjectProduct.id && specProjectService.id && specMachine.id);

  const projectSpecIds = hasAllSpecs
    ? [specProjectDesign.id, specProjectProduct.id, specProjectService.id, specMachine.id]
    : [];

  return {
    specProjectDesign,
    specProjectProduct,
    specProjectService,
    specDpp,
    specMachine,
    specMaterial,
    projectSpecIds,
    hasAllSpecs,
    loading: !vars,
  };
};
