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
import { useAuth } from "hooks/useAuth";
import { EconomicResource, FetchInventoryQuery } from "lib/types";
import { forwardRef, useState } from "react";

export const FETCH_RESOURCES = gql`
  query FetchResources($filter: EconomicResourceFilterParams) {
    economicResources(last: 10, filter: $filter) {
      edges {
        cursor
        node {
          id
          name
        }
      }
    }
  }
`;

// Components
import BrSelectSearchable, { BrSelectSearchableProps } from "components/brickroom/BrSelectSearchable";
import { formatSelectOption, SelectOption } from "./brickroom/utils/BrSelectUtils";

//

export interface SelectResourcesProps extends BrSelectSearchableProps {}

export type ResourceOption = SelectOption<EconomicResource>;

//

const SelectResources = forwardRef<any, SelectResourcesProps>((props, ref) => {
  const [input, setInput] = useState("");
  const { user } = useAuth();

  const resources = useQuery<FetchInventoryQuery>(FETCH_RESOURCES, {
    variables: { filter: { name: input } },
  }).data?.economicResources?.edges.map(a => a.node);

  // Preparing the options for the component
  let options: Array<any> = [];
  if (resources?.length) options = resources.map(a => formatSelectOption(a.name, a));

  return <BrSelectSearchable {...props} options={options} ref={ref} onInputChange={setInput} />;
});

//

SelectResources.displayName = "Select Resources";
export default SelectResources;
