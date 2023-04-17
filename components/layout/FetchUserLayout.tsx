import { gql, useQuery } from "@apollo/client";
import { Spinner } from "@bbtgnn/polaris-interfacer";
import { GetUserQuery, GetUserQueryVariables, Person } from "lib/types";
import { useRouter } from "next/router";
import { createContext, useContext } from "react";

//
type UserContext = {
  person: Partial<Person>;
  id: string;
};

export const UserContext = createContext<UserContext>({} as UserContext);
export const useUser = () => useContext(UserContext);

//

interface Props {
  children: React.ReactNode;
  userIdParam?: string;
}

const FetchUserLayout: React.FunctionComponent<Props> = (props: Props) => {
  const { children, userIdParam = "id" } = props;
  const router = useRouter();
  const id = router.query[userIdParam] as string;

  const { loading, data } = useQuery<GetUserQuery, GetUserQueryVariables>(GET_USER_LAYOUT, {
    variables: { id },
    skip: !id,
  });
  const user = data?.person as Partial<Person>;
  if (loading)
    return (
      <div className="flex pt-40 items-center">
        <div className="mx-auto">
          <Spinner />
        </div>
      </div>
    );
  if (!user) {
    router.push("/404");
    return null;
  }

  return <UserContext.Provider value={{ person: user, id }}>{children}</UserContext.Provider>;
};

export default FetchUserLayout;

//

export const GET_USER_LAYOUT = gql`
  query GetUserLayout($id: ID!) {
    person(id: $id) {
      id
      name
      note
      email
      user
      images {
        hash
        name
        mimeType
        bin
      }
      ethereumAddress
      primaryLocation {
        id
        name
        mappableAddress
        lat
        long
      }
    }
  }
`;
