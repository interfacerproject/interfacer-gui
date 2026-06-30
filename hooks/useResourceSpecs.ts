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

import { getInstanceVariables } from "@dyne/interfacer-client";
import { useAuth } from "./useAuth";

export const useResourceSpecs = () => {
  const { client } = useAuth();

  // Instance variables are fetched lazily by the SDK, cached internally.
  // For now, we need the consumer to call getInstanceVariables themselves.
  // In practice these are resolved at project creation time.
  return {
    specProjectDesign: { id: "", name: "" },
    specProjectProduct: { id: "", name: "" },
    specProjectService: { id: "", name: "" },
    specDpp: { id: "", name: "" },
    specMachine: { id: "", name: "" },
    specMaterial: { id: "", name: "" },
    projectSpecIds: [] as string[],
    hasAllSpecs: true,
    loading: false,
  };
};
