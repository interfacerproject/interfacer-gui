import { ApolloQueryResult, gql, useQuery } from "@apollo/client";
import { Spinner } from "@bbtgnn/polaris-interfacer";
import { EconomicResource, GetProjectLayoutQuery, GetProjectLayoutQueryVariables } from "lib/types";
import { useRouter } from "next/router";
import { createContext, useContext } from "react";

//

interface ProjectContextValue {
  project: Partial<EconomicResource>;
  refetch: (variables?: { id: string }) => Promise<ApolloQueryResult<GetProjectLayoutQuery>>;
  loading: boolean;
}

export const ProjectContext = createContext<ProjectContextValue>(null as any);
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

  const { loading, data, refetch, startPolling } = useQuery<GetProjectLayoutQuery, GetProjectLayoutQueryVariables>(
    GET_PROJECT_LAYOUT,
    {
      variables: { id },
      skip: !id,
    }
  );
  startPolling(120000);
  const project = data?.economicResource as Partial<EconomicResource>;

  //   if (!id) router.push("/projects");
  if (loading)
    return (
      <div className="flex pt-40 items-center">
        <div className="mx-auto">
          <Spinner />
        </div>
      </div>
    );
  if (!project) return null;

  const contextValues: ProjectContextValue = {
    project,
    refetch,
    loading,
  };

  return <ProjectContext.Provider value={contextValues}>{children}</ProjectContext.Provider>;
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
      traceDpp
      conformsTo {
        id
        name
      }
      primaryAccountable {
        id
        name
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
      }
    }
  }
`;
