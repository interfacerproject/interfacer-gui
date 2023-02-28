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
import { Button, Stack, Text } from "@bbtgnn/polaris-interfacer";
import Spinner from "components/brickroom/Spinner";
import PLabel from "components/polaris/PLabel";
import ResourceDetailsCard from "components/ResourceDetailsCard";
import { useAuth } from "hooks/useAuth";
import useWallet from "hooks/useWallet";
import devLog from "lib/devLog";
import { IdeaPoints, StrengthsPoints } from "lib/PointsDistribution";
import {
  ACCEPT_PROPOSAL,
  QUERY_PROPOSAL,
  QUERY_UNIT_AND_CURRENCY,
  REJECT_PROPOSAL,
  SATISFY_INTENTS,
} from "lib/QueryAndMutation";
import { GetUnitAndCurrencyQuery, ProposedStatus, QueryProposalQuery, QueryProposalQueryVariables } from "lib/types";
import { useTranslation } from "next-i18next";
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
  const { addStrengthsPoints, addIdeaPoints } = useWallet();

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

    const acceptanceVariables = {
      process: intents[0].inputOf?.id,
      owner: user!.ulid,
      proposer: intents[0].resourceInventoriedAs?.primaryAccountable.id,
      unitOne: unitAndCurrency?.units.unitOne.id!,
      resourceForked: intents[0].resourceInventoriedAs?.id,
      resourceOrigin: intents[1].resourceInventoriedAs?.id,
      creationTime: new Date().toISOString(),
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

  const switchStatus = {
    [ProposedStatus.Pending]: { text: t("The proposal is still pending"), color: "bg-warning" },
    [ProposedStatus.Accepted]: { text: t("The proposal has been accepted"), color: "bg-success" },
    [ProposedStatus.Refused]: { text: t("The proposal has been rejected"), color: "bg-danger" },
  };

  const renderActions =
    user?.ulid === proposal?.primaryIntents?.[1].resourceInventoriedAs?.primaryAccountable.id &&
    user?.ulid === proposal?.primaryIntents?.[2].resourceInventoriedAs?.primaryAccountable.id &&
    proposal?.status === ProposedStatus.Pending;

  return (
    <div className="mx-auto max-w-lg p-6">
      {loading && !Boolean(proposal?.primaryIntents) ? (
        <Spinner />
      ) : (
        <>
          <Stack vertical spacing="extraLoose">
            <Stack vertical spacing="tight">
              <Text as="h1" variant="headingXl">
                {t("Contribution from ")} {proposal!.primaryIntents![0].resourceInventoriedAs!.primaryAccountable.name}
              </Text>
            </Stack>

            <Stack vertical spacing="extraTight">
              <PLabel label={t("Forked project")} />
              {/* @ts-ignore           */}
              <ResourceDetailsCard resource={proposal.primaryIntents[0].resourceInventoriedAs} />
            </Stack>

            <Stack vertical spacing="tight">
              <Text as="h2" variant="headingLg">
                {t("Status")}
              </Text>
              <div className={`p-4 rounded ${switchStatus[proposal!.status].color}`}>
                <Text as="p" variant="bodyMd">
                  {switchStatus[proposal!.status].text}
                </Text>
              </div>
            </Stack>

            <Stack vertical spacing="tight">
              <Text as="h2" variant="headingLg">
                {t("Contribution info")}
                {":"}
              </Text>
              <div className="mb-2" dangerouslySetInnerHTML={{ __html: MdParser.render(proposal!.note!) }} />
            </Stack>

            <Stack vertical spacing="tight">
              <Text as="h2" variant="headingLg">
                {t("Repository link")}
              </Text>
              <Text as="p" variant="bodyMd">
                {proposal!.primaryIntents![0].resourceInventoriedAs?.repo}
              </Text>
            </Stack>

            {renderActions && (
              <Stack vertical spacing="tight">
                <Text as="h2" variant="headingLg">
                  {t("Your actions")}
                </Text>
                <Button
                  size="large"
                  primary
                  fullWidth
                  submit
                  onClick={onReject}
                  id="submit"
                  disabled={!(status === "PENDING")}
                >
                  {t("Reject contribution")}
                </Button>{" "}
                <Button
                  size="large"
                  primary
                  fullWidth
                  submit
                  onClick={onAccept}
                  disabled={!(status === "PENDING")}
                  id="submit"
                >
                  {t("Accept contribution")}
                </Button>
              </Stack>
            )}

            {/*<CreateContributionFrom onSubmit={onSubmit} error={formError} setError={setFormError} />*/}
          </Stack>
        </>
      )}
    </div>
  );
};

export default Proposal;
