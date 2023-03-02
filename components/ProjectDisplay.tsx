import { gql, useQuery } from "@apollo/client";
import { Spinner, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { EconomicResource, SearchProjectQuery, SearchProjectQueryVariables } from "lib/types";
import { useTranslation } from "next-i18next";
import ProjectThumb from "./ProjectThumb";
import ProjectTypeChip from "./ProjectTypeChip";

export interface Props {
  project?: Partial<EconomicResource>;
  projectId?: string;
  isProductDesign?: boolean;
}

export default function ProjectDisplay(props: Props) {
  const { project, projectId, isProductDesign } = props;
  const { t } = useTranslation("common");

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
    <Stack vertical>
      <Stack spacing="tight">
        <Text as="p" variant="bodyMd">
          {t("Based on") + ":"}
        </Text>
        <ProjectTypeChip noIntroduction />
      </Stack>
      <div className="flex flex-row">
        {!isProductDesign && <ProjectThumb project={p} />}
        <div className={isProductDesign ? "" : "pl-4"}>
          <div className="mb-3 space-y-1">
            <Text as="p" variant="bodyMd" fontWeight="bold">
              {p.name}
            </Text>
            {!isProductDesign && <ProjectTypeChip projectNode={p} />}
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
    </Stack>
  );
}

export const SEARCH_PROJECT = gql`
  query SearchProject($id: ID!) {
    economicResource(id: $id) {
      id
      name
      images {
        bin
        mimeType
      }
      conformsTo {
        name
      }
      primaryAccountable {
        name
      }
    }
  }
`;
