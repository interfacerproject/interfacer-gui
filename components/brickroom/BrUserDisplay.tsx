import { gql, useQuery } from "@apollo/client";
import { Icon, Text } from "@bbtgnn/polaris-interfacer";
import { LocationsMinor } from "@shopify/polaris-icons";
import { Agent, SearchAgentQuery, SearchAgentQueryVariables } from "lib/types";
import BrUserAvatar from "./BrUserAvatar";

export interface Props {
  user?: Agent;
  userId?: string;
}

export default function BrUserDisplay(props: Props) {
  const { user, userId } = props;

  let u: Agent;

  const { data } = useQuery<SearchAgentQuery, SearchAgentQueryVariables>(SEARCH_AGENT, {
    variables: { id: userId! },
    skip: !userId,
  });

  if (user) u = user;
  if (userId && data?.agent) u = data.agent;
  else return <></>;

  return (
    <div className="flex flex-row items-center">
      <div className="w-12">
        <BrUserAvatar name={u.name} />
      </div>

      <div className="ml-4">
        <Text as="p" variant="bodyMd" fontWeight="bold">
          {u.name}
        </Text>
        {u.primaryLocation && (
          <div className="flex items-center text-primary">
            <Icon source={LocationsMinor} color="subdued" />
            <Text as="p" variant="bodyMd" color="subdued">
              {u.primaryLocation.name}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}

export const SEARCH_AGENT = gql`
  query SearchAgent($id: ID!) {
    agent(id: $id) {
      id
      name
      primaryLocation {
        id
        name
      }
    }
  }
`;
