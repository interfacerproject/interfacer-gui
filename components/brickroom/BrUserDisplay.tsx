import { gql, useQuery } from "@apollo/client";
import { Spinner, Text } from "@bbtgnn/polaris-interfacer";
import LocationText from "components/LocationText";
import { GetPersonQuery, GetPersonQueryVariables } from "lib/types";
import { PersonWithFileEssential } from "lib/types/extensions";
import BrUserAvatar from "./BrUserAvatar";

export interface Props {
  user?: PersonWithFileEssential;
  userId?: string;
}

export default function BrUserDisplay(props: Props) {
  const { user, userId } = props;

  let u: Partial<PersonWithFileEssential>;

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
      <BrUserAvatar user={u} size="48px" />

      <div className="ml-4">
        <Text as="p" variant="bodyMd">
          <span className="font-medium">{u.user}</span>
          {u.name != u.user && <span className="ml-1 text-text-subdued">{`(${u.name})`}</span>}
        </Text>
        {u.primaryLocation && <LocationText name={u.primaryLocation.name} />}
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
      images {
        bin
        mimeType
      }
      primaryLocation {
        id
        name
      }
    }
  }
`;
