import { gql, useQuery } from "@apollo/client";
import { Spinner } from "@bbtgnn/polaris-interfacer";
import { EconomicResource, GetProjectLayoutQuery, GetProjectLayoutQueryVariables } from "lib/types";
import { useRouter } from "next/router";
import { createContext, useContext } from "react";

//

export const ProjectContext = createContext<Partial<EconomicResource>>({});
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

  const { loading, data } = useQuery<GetProjectLayoutQuery, GetProjectLayoutQueryVariables>(GET_PROJECT_LAYOUT, {
    variables: { id },
    skip: !id,
  });
  const project = data?.economicResource as Partial<EconomicResource>;

  //   if (!id) router.push("/projects");
  if (loading) return <Spinner />;
  if (!project) return null;

  return <ProjectContext.Provider value={project}>{children}</ProjectContext.Provider>;
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
      primaryAccountable {
        id
        name
      }
      currentLocation {
        id
        name
        mappableAddress
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
