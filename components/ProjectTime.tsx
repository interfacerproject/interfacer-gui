import { gql, useQuery } from "@apollo/client";
import { Spinner } from "@bbtgnn/polaris-interfacer";
import { EconomicEvent, EconomicResource, Process } from "lib/types";
import { useTranslation } from "next-i18next";
import dayjs from "../lib/dayjs";

const GET_TRACE = gql`
  query GetTrace($id: ID!) {
    economicResource(id: $id) {
      trace {
        __typename
        ... on EconomicEvent {
          hasPointInTime
        }
      }
    }
  }
`;

const ProjectTime = (props: { id: string }) => {
  const { id } = props;
  const { t } = useTranslation("common");
  const { data, loading } = useQuery(GET_TRACE, { variables: { id: id } });
  console.log(data);
  // if (loading) return <Spinner/>;
  if (!data) return <div className="py-5" />;
  const e = data.economicResource;
  const hasTime = e.trace?.find((t: Partial<EconomicEvent | Process | EconomicResource>) =>
    // @ts-ignore
    Boolean(t.hasPointInTime)
  ).hasPointInTime;
  const formatted = dayjs(hasTime).format("HH:mm DD/MM/YYYY");
  return (
    <div>
      <div className="font-sans">
        <span className="font-normal">{t("Last updated")}</span>{" "}
        <span className="font-medium">{dayjs(hasTime).fromNow()}</span>
      </div>
      <span className="text-xs">{formatted}</span>
    </div>
  );
};

export default ProjectTime;
