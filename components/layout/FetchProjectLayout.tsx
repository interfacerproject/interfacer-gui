import { ApolloQueryResult, gql, useQuery } from "@apollo/client";
import { Spinner } from "@bbtgnn/polaris-interfacer";
import { useAuth } from "hooks/useAuth";
import { EconomicResource, GetProjectLayoutQuery, GetProjectLayoutQueryVariables } from "lib/types";
import { useRouter } from "next/router";
import { createContext, useContext } from "react";

//
interface ProjectContextValue {
  project: Partial<EconomicResource>;
  refetch: (variables?: { id?: string }) => Promise<ApolloQueryResult<GetProjectLayoutQuery>>;
  isOwner?: boolean;
  loading: boolean;
}

export const ProjectContext = createContext<ProjectContextValue>({} as ProjectContextValue);
export const useProject = () => useContext(ProjectContext);

//

interface Props {
  children: React.ReactNode;
  projectIdParam?: string;
}

const FetchProjectLayout: React.FunctionComponent<Props> = (props: Props) => {
  const { children, projectIdParam = "id" } = props;
  const router = useRouter();
  const id = router.query[projectIdParam] as string;
  const { user } = useAuth();

  const { loading, data, refetch, startPolling } = useQuery<GetProjectLayoutQuery, GetProjectLayoutQueryVariables>(
    GET_PROJECT_LAYOUT,
    {
      variables: { id },
      skip: !id,
    }
  );
  startPolling(120000);
  const project = data?.economicResource as Partial<EconomicResource>;
  const isOwner = user?.ulid == project?.primaryAccountable?.id;
  if (loading)
    return (
      <div className="flex pt-40 items-center">
        <div className="mx-auto">
          <Spinner />
        </div>
      </div>
    );
  if (!project) router.push("/404");

  const contextValue: ProjectContextValue = {
    project,
    refetch,
    isOwner,
    loading,
  };

  return <ProjectContext.Provider value={contextValue}>{children}</ProjectContext.Provider>;
};

export default FetchProjectLayout;

//

export const GET_PROJECT_LAYOUT = gql`
  query getProjectLayout($id: ID!) {
    economicResource(id: $id) {
      id
      name
      note
      metadata
      license
      repo
      classifiedAs
      accountingQuantity {
        hasNumericalValue
      }
      onhandQuantity {
        hasUnit {
          id
        }
        hasNumericalValue
      }
      conformsTo {
        id
        name
      }
      primaryAccountable {
        id
        name
        primaryLocation {
          name
          mappableAddress
          lat
          long
        }
      }
      currentLocation {
        id
        name
        mappableAddress
        lat
        long
      }
      images {
        hash
        name
        mimeType
        bin
        date
        description
        extension
        size
      }
      trace {
        __typename
        ... on Process {
          id
          name
        }
        ... on EconomicEvent {
          id
          hasPointInTime
        }
      }
    }
  }
`;
