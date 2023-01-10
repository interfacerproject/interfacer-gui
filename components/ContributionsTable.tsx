import { useQuery } from "@apollo/client";
import dayjs from "dayjs";
import devLog from "lib/devLog";
import { QUERY_RESOURCE_PROPOSAlS } from "lib/QueryAndMutation";
import { ResourceProposalsQuery, ResourceProposalsQueryVariables } from "lib/types";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import BrDisplayUser from "./brickroom/BrDisplayUser";
import BrTable from "./brickroom/BrTable";

const ContributionsTable = ({ id, title }: { id: string; title?: string }) => {
  const { t } = useTranslation("common");
  const { data } = useQuery<ResourceProposalsQuery, ResourceProposalsQueryVariables>(QUERY_RESOURCE_PROPOSAlS, {
    variables: { id: id },
  });
  devLog("resource proposals", data);
  const proposals = data?.proposals.edges;
  devLog("proposals", proposals);

  return (
    <>
      {title && <h3 className="my-6">{title}</h3>}
      <BrTable headArray={[t("Username"), t("Description"), t("Last update"), t("Status")]}>
        {proposals &&
          proposals.map(proposal => (
            <Link href={`/proposal/${proposal.node.id}`} key={proposal.node.id}>
              <tr className="cursor-pointer">
                <td>
                  <BrDisplayUser
                    id={proposal.node.primaryIntents![0].provider?.id!}
                    name={proposal.node.primaryIntents![0].provider?.name!}
                  />
                </td>
                <td>{proposal.node.note}</td>
                <td>
                  <p className="mr-1">{dayjs(proposal.node.created).fromNow()}</p>
                  <p className="text-xs">{dayjs(proposal.node.created).format("HH:mm")}</p>
                  <p className="text-xs">{dayjs(proposal.node.created).format("DD/MM/YYYY")}</p>
                </td>
                <td>{proposal.node.status}</td>
              </tr>
            </Link>
          ))}
      </BrTable>
    </>
  );
};

export default ContributionsTable;
