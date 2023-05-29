import { gql, useQuery } from "@apollo/client";
import { Spinner, Text } from "@bbtgnn/polaris-interfacer";
import dayjs from "lib/dayjs";
import { useTranslation } from "next-i18next";

const LoshImportedDate = (p: { projectId: string }) => {
  const { projectId } = p;
  const { t } = useTranslation("common");
  const { loading, data } = useQuery(GET_PROJECT_TRACE, {
    variables: { id: projectId },
  });
  const addedOn = data?.economicResource?.trace.find((t: any) => t.action?.id === "raise").hasPointInTime;
  if (loading) return <Spinner />;
  return (
    <Text variant="bodyMd" as="h3">
      {t("Added on ") + dayjs(addedOn).format("YY-MM-DD")}
    </Text>
  );
};

export const GET_PROJECT_TRACE = gql`
  query getProjectTrace($id: ID!) {
    economicResource(id: $id) {
      trace {
        __typename
        ... on EconomicEvent {
          hasPointInTime
          action {
            id
          }
        }
      }
    }
  }
`;

export default LoshImportedDate;
