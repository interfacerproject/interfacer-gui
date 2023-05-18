import { gql, useQuery } from "@apollo/client";
import { Spinner, Text } from "@bbtgnn/polaris-interfacer";
import LocationText from "components/LocationText";
import { GetPersonQuery, GetPersonQueryVariables } from "lib/types";
import { PersonWithFileEssential } from "lib/types/extensions";
import React, { createContext, useContext } from "react";
import BrUserAvatar from "./BrUserAvatar";

export interface Props {
  user?: PersonWithFileEssential;
  userId?: string;
  children?: JSX.Element[];
}

const userContext = createContext<Partial<PersonWithFileEssential> | undefined>(undefined);
export const useUserContext = () => useContext(userContext);

const getChildrenOnDisplayName = (children: JSX.Element[], displayName: string) =>
  React.Children.map(children, child => (child.type.DisplayName === displayName ? child : null));

const Avatar = () => {
  const user = useUserContext();
  return (
    <>
      <BrUserAvatar user={user} size="48px" />
    </>
  );
};

const Name = () => {
  const user = useUserContext();
  return (
    <Text as="p" variant="bodyMd">
      <span className="font-medium">{user?.user}</span>
      {user?.name != user?.user && <span className="ml-1 text-text-subdued">{`(${user?.name})`}</span>}
    </Text>
  );
};

const Location = () => {
  const user = useUserContext();
  if (!user?.primaryLocation) return <></>;
  return <LocationText name={user.primaryLocation.name} />;
};

export default function BrUserDisplay(props: Props) {
  const { user, userId, children } = props;

  let avatar, name, location;

  if (children) {
    avatar = getChildrenOnDisplayName(children, "Avatar");
    name = getChildrenOnDisplayName(children, "Name");
    location = getChildrenOnDisplayName(children, "Location");
  } else {
    avatar = <Avatar />;
    name = <Name />;
    location = <Location />;
  }

  let u: Partial<PersonWithFileEssential>;

  const { data, loading } = useQuery<GetPersonQuery, GetPersonQueryVariables>(SEARCH_PERSON, {
    variables: { id: userId! },
    skip: !userId,
  });

  if (loading) return <Spinner />;

  if (user) u = user;
  else if (userId && data?.person) u = data.person;
  else return <></>;

  return (
    <userContext.Provider value={u}>
      <div className="flex flex-row items-center">
        {avatar}
        <div className="ml-4">
          {name}
          {location}
        </div>
      </div>
    </userContext.Provider>
  );
}

Avatar.DisplayName = "Avatar";
Name.DisplayName = "Name";
Location.DisplayName = "Location";

BrUserDisplay.Avatar = Avatar;
BrUserDisplay.Name = Name;
BrUserDisplay.Location = Location;

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
