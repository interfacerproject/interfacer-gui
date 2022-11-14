import { useQuery } from "@apollo/client";
import { useAuth } from "hooks/useAuth";
import { QUERY_AGENTS } from "lib/QueryAndMutation";
import { GetAgentQuery } from "lib/types";
import { forwardRef } from "react";

// Components
import BrSelectSearchable, { BrSelectSearchableProps } from "components/brickroom/BrSelectSearchable";

//

export interface SelectContributorsProps extends BrSelectSearchableProps {
  removeCurrentUser?: boolean;
}

//

const SelectContributors = forwardRef<any, SelectContributorsProps>((props, ref) => {
  const { removeCurrentUser = true } = props;
  const { user } = useAuth();

  const agents = useQuery<GetAgentQuery>(QUERY_AGENTS).data?.agents?.edges.map(a => a.node);

  // If no agents are found, return error
  // Next iteration of the component will use an async loading
  // ToDo – Return proper error
  if (!agents) return <></>;

  // Preparing the options for the component
  let options = agents.map(a => ({
    value: a.id,
    label: a.name,
  }));

  // Removing the current user from the list
  if (removeCurrentUser) options = options.filter(a => a.value != user?.ulid);

  return <BrSelectSearchable {...props} options={options} ref={ref} />;
});

//

SelectContributors.displayName = "SelectContributors";
export default SelectContributors;
