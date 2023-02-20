import { gql, useQuery } from "@apollo/client";
import { Icon, Spinner, Text } from "@bbtgnn/polaris-interfacer";
import { LocationsMinor } from "@shopify/polaris-icons";
import { GetPersonQuery, GetPersonQueryVariables, Person } from "lib/types";
import BrUserAvatar from "./BrUserAvatar";

export interface Props {
  user?: Person;
  userId?: string;
}

export default function BrUserDisplay(props: Props) {
  const { user, userId } = props;

  let u: Partial<Person>;

  const { data, loading } = useQuery<GetPersonQuery, GetPersonQueryVariables>(SEARCH_PERSON, {
    variables: { id: userId! },
    skip: !userId,
  });

  if (loading) return <Spinner />;

  if (user) u = user;
  if (userId && data?.person) u = data.person;
  else return <></>;

  return (
    <div className="flex flex-row items-center">
      <div className="w-12">
        <BrUserAvatar name={u.name} />
      </div>

      <div className="ml-4">
        <Text as="p" variant="bodyMd">
          <span className="font-medium">{u.user}</span>
          {u.name != u.user && <span className="ml-1 text-text-subdued">{`(${u.name})`}</span>}
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

export const SEARCH_PERSON = gql`
  query getPerson($id: ID!) {
    person(id: $id) {
      id
      name
      user
      primaryLocation {
        id
        name
      }
    }
  }
`;
