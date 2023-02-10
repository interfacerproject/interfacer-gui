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

import { projectTypesQueryToSelectOptions } from "lib/formatProjectTypes";

// Request
import { useQuery } from "@apollo/client";
import { QUERY_PROJECT_TYPES } from "lib/QueryAndMutation";
import { GetProjectTypesQuery } from "lib/types";

// Components
import BrSearchableSelect, { BrSelectSearchableProps } from "components/brickroom/BrSelectSearchable";

//

export default function SelectProjectType(props: BrSelectSearchableProps) {
  // Loading project types
  const projectTypes = useQuery<GetProjectTypesQuery>(QUERY_PROJECT_TYPES).data;

  // If projectTypes are not loaded, don't show the component
  if (!projectTypes) return <></>;

  // Prepping options
  const options = projectTypesQueryToSelectOptions(projectTypes);

  //

  return <BrSearchableSelect options={options} isMulti {...props} />;
}
