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
import { useAuth } from "hooks/useAuth";
import { QUERY_AGENTS } from "lib/QueryAndMutation";
import { Agent, GetAgentQuery, Organization } from "lib/types";
import { forwardRef } from "react";

// Components
import BrSelectSearchable, { BrSelectSearchableProps } from "components/brickroom/BrSelectSearchable";
import { formatSelectOption, SelectOption } from "./brickroom/utils/BrSelectUtils";

//

export interface SelectContributorsProps extends BrSelectSearchableProps {
  removeCurrentUser?: boolean;
}

export type ContributorOption = SelectOption<Agent | Organization>;

//

const SelectContributors = forwardRef<any, SelectContributorsProps>((props, ref) => {
  const { removeCurrentUser = true, defaultValueRaw } = props;
  const { user } = useAuth();

  const agents = useQuery<GetAgentQuery>(QUERY_AGENTS).data?.agents?.edges.map(a => a.node);

  let defaultValue;

  // Preparing the options for the component
  let options: Array<ContributorOption> = [];
  if (agents?.length) options = agents.map(a => formatSelectOption(a.name, a));
  if (removeCurrentUser) options = options.filter(a => a.value.id != user?.ulid);
  if (defaultValueRaw) defaultValue = options?.filter(a => defaultValueRaw.includes(a.value.id));

  return <BrSelectSearchable {...props} options={options} ref={ref} value={defaultValue} />;
});

//

SelectContributors.displayName = "SelectContributors";
export default SelectContributors;
