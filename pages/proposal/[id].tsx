// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { useQuery } from "lib/apollo-compat";
import { Badge, Button, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { Status } from "@bbtgnn/polaris-interfacer/build/ts/latest/src/components/Badge";
import ResourceDetailsCard from "components/ResourceDetailsCard";
import Spinner from "components/brickroom/Spinner";
import PLabel from "components/polaris/PLabel";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import ProposalActions from "components/proposal/ProposalActions";
import { QUERY_PROPOSAL } from "lib/QueryAndMutation";
import devLog from "lib/devLog";
import { ProposedStatus, QueryProposalQuery, QueryProposalQueryVariables } from "lib/types";
import { GetStaticPaths } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useRouter } from "next/router";
import MdParser from "../../lib/MdParser";

const Proposal = () => {
  const router = useRouter();
  const { t } = useTranslation("ProposalProps");
  const { id } = router.query;
  const { data, loading, refetch } = useQuery<QueryProposalQuery, QueryProposalQueryVariables>(QUERY_PROPOSAL, {
    variables: { id: id?.toString() || "" },
  });

  const proposal = data?.proposal;
  devLog("proposal", proposal);

  const switchStatus: Record<ProposedStatus, { text: string; color: Status }> = {
    [ProposedStatus.Pending]: { text: t("The proposal is still pending"), color: "attention" },
    [ProposedStatus.Accepted]: { text: t("The proposal has been accepted"), color: "success" },
    [ProposedStatus.Refused]: { text: t("The proposal has been rejected"), color: "critical" },
  };

  // Keep the page (and ProposalActions state) mounted while refetching.
  if (loading && !proposal) return <Spinner />;
  if (!proposal) return router.push("/404");
  const contributionProject = proposal.primaryIntents![1].resourceInventoriedAs;
  const originalProject = proposal.primaryIntents![0].resourceInventoriedAs;

  return (
    <>
      <div className="mx-auto w-full max-w-lg px-4 pt-6 min-h-full">
        <Stack vertical spacing="extraLoose">
          <div className="flex justify-between">
            <PTitleSubtitle title={t("Contribution Proposal")} subtitle={t("Read the comunity guidelines")} />
            <div className="flex-shrink">
              <Badge status={switchStatus[proposal!.status].color}>{proposal!.status}</Badge>
            </div>
          </div>

          <Stack vertical spacing="extraTight">
            <Text as="h2" variant="headingXl">
              {proposal!.name}
            </Text>
            <Text as="p" variant="bodyLg">
              {t("this is a contribution proposal to yours ")}
              <Link href={`/project/${originalProject!.id}`}>
                <a>{originalProject!.name}</a>
              </Link>
            </Text>
          </Stack>

          <Stack vertical spacing="extraTight">
            <PLabel label={t("Project:")} />
            <div className="flex flex-row justify-between gap-2">
              <div className="flex-grow">
                {/* @ts-ignore */}
                <ResourceDetailsCard resource={contributionProject} />
              </div>
              <Stack vertical spacing="extraTight">
                <div className="float-right">
                  <Button primary onClick={() => router.push(`/project/${contributionProject!.id}`)}>
                    {t("Go to project")}
                  </Button>
                </div>
                <Button onClick={() => router.push(contributionProject!.repo!)}>{t("External data")}</Button>
              </Stack>
            </div>
          </Stack>

          <Stack vertical spacing="tight">
            <PLabel label={t("Contribution info") + ":"} />
            <div className="mb-2" dangerouslySetInnerHTML={{ __html: MdParser.render(proposal!.note!) }} />
          </Stack>
        </Stack>
      </div>

      <ProposalActions proposal={proposal} refetch={refetch} />
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => ({ paths: [], fallback: "blocking" });

export async function getStaticProps({ locale }: any) {
  return { props: { ...(await serverSideTranslations(locale, ["common", "ProposalProps"])) } };
}

export default Proposal;
