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

import { IdeaPoints, StrengthsPoints } from "lib/PointsDistribution";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement, useState } from "react";

// Request
import { useMutation, useQuery } from "@apollo/client";
import { useAuth } from "hooks/useAuth";
import useInBox from "hooks/useInBox";
import {
  CREATE_PROCESS,
  CREATE_PROPOSAL,
  LINK_CONTRIBUTION_PROPOSAL_INTENT,
  PROPOSE_CONTRIBUTION,
  QUERY_UNIT_AND_CURRENCY,
} from "lib/QueryAndMutation";
import devLog from "lib/devLog";
import { GetUnitAndCurrencyQuery } from "lib/types";
import { MessageSubject, ProposalNotification } from "../../notification";

// Components
import FetchProjectLayout, { useProject } from "components/layout/FetchProjectLayout";
import Layout from "components/layout/Layout";
import CreateContributionFrom, { FormValues } from "components/partials/create/contribution/CreateContributionForm";
import useWallet from "hooks/useWallet";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticPaths } from "next";

//

const ProposeContribution: NextPageWithLayout = () => {
  const { t } = useTranslation("common");
  const [formError, setFormError] = useState("");

  const router = useRouter();
  const { user } = useAuth();
  const { sendMessage } = useInBox();
  const { addStrengthsPoints, addIdeaPoints } = useWallet({});

  const unitAndCurrency = useQuery<GetUnitAndCurrencyQuery>(QUERY_UNIT_AND_CURRENCY).data?.instanceVariables;
  const [createProcess] = useMutation(CREATE_PROCESS);
  const [createProposal] = useMutation(CREATE_PROPOSAL);
  const [proposeContribution] = useMutation(PROPOSE_CONTRIBUTION);
  const [linkProposalAndIntents] = useMutation(LINK_CONTRIBUTION_PROPOSAL_INTENT);

  const { project: resource } = useProject();

  const onSubmit = async (formData: FormValues) => {
    if (!resource) throw new Error("No original resource found");
    const forkedProjectId = formData.project;
    if (!forkedProjectId) throw new Error("No forked project id found");

    const processContributionName = formData.name || `contribution of ${resource.name} by ${user!.name}`;
    const proposeProcessVariables = {
      name: processContributionName,
    };
    const processContribution = await createProcess({ variables: proposeProcessVariables });

    const proposalVariables = { name: processContributionName, note: formData.description };
    devLog("proposalVariables", proposalVariables);
    const proposal = await createProposal({ variables: proposalVariables });
    devLog("The proposal was created successfully with id: " + JSON.stringify(proposal));

    const contributionVariables = {
      resourceForked: forkedProjectId,
      resourceOrigin: resource.id,
      process: processContribution.data?.createProcess.process.id,
      owner: resource.primaryAccountable!.id,
      proposer: user!.ulid,
      unitOne: unitAndCurrency!.units.unitOne.id!,
      creationTime: new Date().toISOString(),
    };
    devLog("The contribution variables are: ", contributionVariables);
    const contribution = await proposeContribution({ variables: contributionVariables });
    devLog("The intent is " + JSON.stringify(contribution));
    const linkProposalAndIntentsVariables = {
      proposal: proposal.data?.createProposal.proposal.id,
      citeIntent: contribution.data?.citeResourceForked.intent.id,
      acceptIntent: contribution.data?.acceptResourceOrigin.intent.id,
      modifyIntent: contribution.data?.modifyResourceOrigin.intent.id,
    };
    devLog("The link variables are: ", linkProposalAndIntentsVariables);
    const linkProposalAndIntentsResult = await linkProposalAndIntents({ variables: linkProposalAndIntentsVariables });
    devLog("The link result is " + JSON.stringify(linkProposalAndIntentsResult));
    const message: ProposalNotification = {
      proposalID: proposal.data?.createProposal.proposal.id,
      text: formData.description,
      originalResourceName: resource.name!,
      originalResourceID: resource.id!,
      proposerName: user!.name,
      ownerName: resource.primaryAccountable!.name,
    };

    sendMessage(message, [resource.primaryAccountable!.id], MessageSubject.CONTRIBUTION_REQUEST);

    //economic system: points assignments
    addIdeaPoints(resource.primaryAccountable!.id, IdeaPoints.OnFork);
    addStrengthsPoints(user!.ulid, StrengthsPoints.OnFork);

    router.push(`/proposal/${proposal.data?.createProposal.proposal.id}`);
  };

  return <CreateContributionFrom onSubmit={onSubmit} error={formError} setError={setFormError} />;
};

ProposeContribution.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout>
      <FetchProjectLayout>{page}</FetchProjectLayout>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default ProposeContribution;
