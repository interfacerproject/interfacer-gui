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

import { useMutation, useQuery } from "@apollo/client";
import { Badge, Button, Icon, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { Status } from "@bbtgnn/polaris-interfacer/build/ts/latest/src/components/Badge";
import { AddProductMajor, RemoveProductMajor } from "@shopify/polaris-icons";
import ResourceDetailsCard from "components/ResourceDetailsCard";
import Spinner from "components/brickroom/Spinner";
import PLabel from "components/polaris/PLabel";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { useAuth } from "hooks/useAuth";
import useWallet from "hooks/useWallet";
import { IdeaPoints, StrengthsPoints } from "lib/PointsDistribution";
import {
  ACCEPT_PROPOSAL,
  QUERY_PROPOSAL,
  QUERY_UNIT_AND_CURRENCY,
  REJECT_PROPOSAL,
  SATISFY_INTENTS,
} from "lib/QueryAndMutation";
import devLog from "lib/devLog";
import { GetUnitAndCurrencyQuery, ProposedStatus, QueryProposalQuery, QueryProposalQueryVariables } from "lib/types";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import useInBox from "../../hooks/useInBox";
import MdParser from "../../lib/MdParser";
import { MessageSubject, ProposalNotification } from "../notification";

const Proposal = () => {
  const router = useRouter();
  const { t } = useTranslation("ProposalProps");
  const { id } = router.query;
  const { user } = useAuth();
  const { data, loading, refetch } = useQuery<QueryProposalQuery, QueryProposalQueryVariables>(QUERY_PROPOSAL, {
    variables: { id: id?.toString() || "" },
  });
  const { sendMessage } = useInBox();
  const { addStrengthsPoints, addIdeaPoints } = useWallet({});

  const unitAndCurrency = useQuery<GetUnitAndCurrencyQuery>(QUERY_UNIT_AND_CURRENCY).data?.instanceVariables;
  const [acceptProposal] = useMutation(ACCEPT_PROPOSAL);
  const [satisfyIntents] = useMutation(SATISFY_INTENTS);
  const [rejectProposal] = useMutation(REJECT_PROPOSAL);

  const proposal = data?.proposal;
  devLog("proposal", proposal);
  const status = proposal?.status;

  const onReject = async () => {
    if (!proposal) return;
    const intents = proposal.primaryIntents;
    if (!intents) return;
    const rejectProposalVariables = {
      intentCite: intents[0].id,
      intentAccept: intents[1].id,
      intentModify: intents[2].id,
    };

    devLog("rejectProposalVariables", rejectProposalVariables);
    const rejection = await rejectProposal({ variables: rejectProposalVariables });
    devLog("Proposal rejected", rejection);

    const message: ProposalNotification = {
      originalResourceName: proposal.primaryIntents![0].resourceInventoriedAs?.name || "",
      originalResourceID: proposal.primaryIntents![0].resourceInventoriedAs?.id || "",
      proposalID: proposal.id,
      ownerName: user!.name,
      proposerName: user!.name,
      text: proposal.note || "",
    };

    await sendMessage(
      message,
      [proposal.primaryIntents![0].resourceInventoriedAs!.primaryAccountable.id],
      MessageSubject.CONTRIBUTION_REJECTED
    );
    await refetch();
  };

  const onAccept = async () => {
    if (!proposal) return;
    const intents = proposal.primaryIntents;
    if (!intents) return;

    const cite = intents[0];
    const accept = intents[1];
    const fork = cite.resourceInventoriedAs;
    const toBeModifiedResource = accept.resourceInventoriedAs;

    const oldRelations = fork?.metadata.relations?.filter((id: string) => id != toBeModifiedResource?.id) || [];

    const acceptanceVariables = {
      process: cite.inputOf?.id || cite.outputOf?.id,
      owner: user!.ulid,
      proposer: fork?.primaryAccountable.id,
      unitOne: unitAndCurrency?.units.unitOne.id!,
      resourceForked: fork?.id,
      resourceOrigin: toBeModifiedResource?.id,
      creationTime: new Date().toISOString(),
      metadata: JSON.stringify({
        ...toBeModifiedResource?.metadata,
        relations: [...oldRelations, fork?.id!],
      }),
    };
    devLog("acceptanceVariables", acceptanceVariables);
    const economicEvents = await acceptProposal({ variables: acceptanceVariables });
    devLog("economicEvents created", economicEvents);

    const satisfyIntentsVariables = {
      unitOne: unitAndCurrency?.units.unitOne.id!,
      intentCited: intents[0].id,
      intentAccepted: intents[1].id,
      intentModify: intents[2].id,
      eventCite: economicEvents.data.cite.economicEvent.id,
      eventAccept: economicEvents.data.accept.economicEvent.id,
      eventModify: economicEvents.data.modify.economicEvent.id,
    };
    devLog("satisfyIntentsVariables", satisfyIntentsVariables);
    const intentsSatisfied = await satisfyIntents({ variables: satisfyIntentsVariables });
    devLog("intentsSatisfied created", intentsSatisfied);
    const message: ProposalNotification = {
      originalResourceName: proposal.primaryIntents![0].resourceInventoriedAs?.name || "",
      originalResourceID: proposal.primaryIntents![0].resourceInventoriedAs?.id || "",
      proposalID: proposal.id,
      ownerName: user!.name,
      proposerName: user!.name,
      text: proposal.note || "",
    };
    await sendMessage(
      message,
      [proposal.primaryIntents![0].resourceInventoriedAs!.primaryAccountable.id],
      MessageSubject.CONTRIBUTION_ACCEPTED
    );

    //economic system: points assignments
    addStrengthsPoints(proposal.primaryIntents![0].resourceInventoriedAs!.primaryAccountable.id, IdeaPoints.OnAccept);
    addIdeaPoints(user!.ulid, StrengthsPoints.OnAccept);

    await refetch();
  };

  const switchStatus: Record<ProposedStatus, { text: string; color: Status }> = {
    [ProposedStatus.Pending]: { text: t("The proposal is still pending"), color: "attention" },
    [ProposedStatus.Accepted]: { text: t("The proposal has been accepted"), color: "success" },
    [ProposedStatus.Refused]: { text: t("The proposal has been rejected"), color: "critical" },
  };

  const renderActions =
    user?.ulid === proposal?.primaryIntents?.[1].resourceInventoriedAs?.primaryAccountable.id &&
    user?.ulid === proposal?.primaryIntents?.[2].resourceInventoriedAs?.primaryAccountable.id &&
    proposal?.status === ProposedStatus.Pending;

  if (loading) return <Spinner />;
  if (!proposal) return router.push("/404");
  const contributionProject = proposal.primaryIntents![1].resourceInventoriedAs;
  const originalProject = proposal.primaryIntents![0].resourceInventoriedAs;

  return (
    <>
      <div className="mx-auto max-w-lg pt-6 min-h-full">
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
                <Button onClick={() => router.push(contributionProject!.repo!)}>{t("Go to source")}</Button>
              </Stack>
            </div>
          </Stack>

          <Stack vertical spacing="tight">
            <PLabel label={t("Contribution info") + ":"} />
            <div className="mb-2" dangerouslySetInnerHTML={{ __html: MdParser.render(proposal!.note!) }} />
          </Stack>
        </Stack>
      </div>

      {renderActions && (
        <div className="bg-yellow-100 border-t-1 border-t-border-warning-subdued p-4 flex justify-end items-center space-x-6 sticky bottom-0 z-20">
          <div className="space-x-2">
            <Button
              size="large"
              submit
              onClick={onReject}
              id="submit"
              icon={<Icon source={RemoveProductMajor} />}
              disabled={!(status === "PENDING")}
            >
              {t("Reject contribution")}
            </Button>
            <Button
              size="large"
              primary
              submit
              onClick={onAccept}
              icon={<Icon source={AddProductMajor} />}
              disabled={!(status === "PENDING")}
              id="submit"
            >
              {t("Accept contribution")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Proposal;
