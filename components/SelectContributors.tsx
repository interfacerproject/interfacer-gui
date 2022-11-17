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
  const { removeCurrentUser = true } = props;
  const { user } = useAuth();

  const agents = useQuery<GetAgentQuery>(QUERY_AGENTS).data?.agents?.edges.map(a => a.node);

  // Preparing the options for the component
  let options: Array<ContributorOption> = [];
  if (agents?.length) options = agents.map(a => formatSelectOption(a.name, a));
  if (removeCurrentUser) options = options.filter(a => a.value.id != user?.ulid);

  return <BrSelectSearchable {...props} options={options} ref={ref} />;
});

//

SelectContributors.displayName = "SelectContributors";
export default SelectContributors;
