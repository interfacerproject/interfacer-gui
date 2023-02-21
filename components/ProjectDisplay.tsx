import { gql, useQuery } from "@apollo/client";
import { Spinner, Tag, Text } from "@bbtgnn/polaris-interfacer";
import { EconomicResource, SearchProjectQuery, SearchProjectQueryVariables } from "lib/types";
import ProjectThumb from "./ProjectThumb";

export interface Props {
  project?: Partial<EconomicResource>;
  projectId?: string;
}

export default function ProjectDisplay(props: Props) {
  const { project, projectId } = props;

  let p: Partial<EconomicResource>;

  const { data, loading } = useQuery<SearchProjectQuery, SearchProjectQueryVariables>(SEARCH_PROJECT, {
    variables: { id: projectId! },
    skip: !projectId,
  });

  if (loading) return <Spinner />;
  if (project) p = project;
  else if (projectId && data?.economicResource) p = data?.economicResource as Partial<EconomicResource>;
  else return <></>;

  return (
    <div className="flex flex-row">
      <ProjectThumb project={p} />
      <div className="pl-4">
        <div className="mb-3 space-y-1">
          <Text as="p" variant="bodyMd" fontWeight="bold">
            {p.name}
          </Text>
          <Tag>{p.conformsTo?.name}</Tag>
        </div>
        <div className="font-mono">
          <Text as="p" variant="bodyMd">
            <span className="font-bold">{"ID: "}</span>
            <span>{p.id}</span>
          </Text>
          <Text as="p" variant="bodyMd">
            <span className="font-bold">{"Owner: "}</span>
            <span>{p.primaryAccountable?.name}</span>
          </Text>
        </div>
      </div>
    </div>
  );
}

export const SEARCH_PROJECT = gql`
  query SearchProject($id: ID!) {
    economicResource(id: $id) {
      id
      name
      conformsTo {
        name
      }
      primaryAccountable {
        name
      }
    }
  }
`;
