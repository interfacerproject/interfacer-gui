import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement, useState } from "react";

// Request
import { useMutation, useQuery } from "@apollo/client";
import { useAuth } from "hooks/useAuth";
import useInBox from "hooks/useInBox";
import devLog from "lib/devLog";
import {
  CREATE_PROCESS,
  CREATE_PROPOSAL,
  FORK_PROJECT,
  LINK_CONTRIBUTION_PROPOSAL_INTENT,
  PROPOSE_CONTRIBUTION,
  QUERY_RESOURCE,
  QUERY_UNIT_AND_CURRENCY,
} from "lib/QueryAndMutation";
import { EconomicResource, GetUnitAndCurrencyQuery } from "lib/types";
import { MessageSubject, ProposalNotification } from "../../notification";

// Components
import { Button, Card, Stack, Text } from "@bbtgnn/polaris-interfacer";
import Layout from "components/layout/Layout";
import CreateContributionFrom from "components/partials/create/contribution/CreateContributionForm";
import PLabel from "components/polaris/PLabel";
import ResourceDetailsCard from "components/ResourceDetailsCard";

//

const CreateContribution: NextPageWithLayout = () => {
  const { t } = useTranslation("CreateContributionProps");
  const [formError, setFormError] = useState("");

  const router = useRouter();
  const { resourceID } = router.query;
  const id = resourceID?.toString() || "";
  const { user } = useAuth();
  const { sendMessage } = useInBox();

  const unitAndCurrency = useQuery<GetUnitAndCurrencyQuery>(QUERY_UNIT_AND_CURRENCY).data?.instanceVariables;
  const [createProcess] = useMutation(CREATE_PROCESS);
  const [forkProject] = useMutation(FORK_PROJECT);
  const [createProposal] = useMutation(CREATE_PROPOSAL);
  const [proposeContribution] = useMutation(PROPOSE_CONTRIBUTION);
  const [linkProposalAndIntents] = useMutation(LINK_CONTRIBUTION_PROPOSAL_INTENT);

  const { data, error } = useQuery<{ economicResource: EconomicResource }>(QUERY_RESOURCE, {
    variables: { id },
  });

  const resource = data?.economicResource;

  const findCreationProcessId = (resource: EconomicResource) => {
    const _process = resource?.trace?.find(t => t.__typename === "Process" && t.name.includes("creation"));
    return _process?.id;
  };

  const onSubmit = async (formData: any) => {
    if (!resource) throw new Error("No original resource found");
    else {
      const processName = `fork of ${resource.name} by ${user!.name}`;
      const processVariables = { name: processName };
      devLog("processVariables", processVariables);
      const { data: processData, errors } = await createProcess({
        variables: processVariables,
      });
      if (errors) throw new Error(errors[0].message);
      devLog("The process was created successfully with id: " + processData.createProcess.process.id);
      const forkVariables = {
        resource: id,
        process: processData.createProcess.process.id,
        agent: user!.ulid,
        name: `${resource!.name} forked by ${user!.name}`,
        note: formData.description,
        metadata: JSON.stringify(resource?.metadata),
        location: resource!.currentLocation?.id,
        unitOne: unitAndCurrency?.units.unitOne.id!,
        creationTime: new Date().toISOString(),
        repo: formData.contributionRepositoryID,
        tags: resource!.classifiedAs,
        spec: resource!.conformsTo.id,
      };
      devLog("The forking variables are: ", forkVariables);
      const forkedProject = await forkProject({ variables: forkVariables });
      devLog("The forked project was created successfully with id: " + JSON.stringify(forkedProject));
      const forkedProjectId = forkedProject.data?.produce.economicEvent?.resourceInventoriedAs?.id;
      if (!forkedProjectId) throw new Error("No forked project id found");

      const processContributionName = `contribution of ${resource.name} by ${user!.name}`;
      const proposeProcessVariables = {
        name: processContributionName,
      };
      const processContribution = await createProcess({ variables: proposeProcessVariables });

      const proposalVariables = { name: processName, note: formData.description };
      devLog("proposallVariables", processVariables);
      const proposal = await createProposal({ variables: proposalVariables });
      devLog("The proposal was created successfully with id: " + JSON.stringify(proposal));

      devLog(findCreationProcessId(resource));

      const contributionVariables = {
        resourceForked: forkedProjectId,
        resourceOrigin: resource.id,
        process: processContribution.data?.createProcess.process.id,
        owner: resource.primaryAccountable.id,
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
        type: formData.type,
        originalResourceName: resource.name,
        originalResourceID: resource.id,
        proposerName: user!.name,
        ownerName: resource.primaryAccountable.name,
      };
      sendMessage(message, [resource.primaryAccountable.id], MessageSubject.CONTRIBUTION_REQUEST);
      router.push(`/proposal/${proposal.data?.createProposal.proposal.id}`);
    }
  };

  if (error) {
    return (
      <Card>
        <div className="p-4 text-center text-red-600 space-y-2">
          <p>{t("Resource not found")}</p>
          <pre>{t(error.message)}</pre>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="p-4 text-text-primary">
        <Button
          onClick={() => {
            router.back();
          }}
          plain
          monochrome
        >
          {t("??? Discard and go back")}
        </Button>
      </div>

      <div className="mx-auto max-w-lg p-6">
        <Stack vertical spacing="extraLoose">
          <Stack vertical spacing="tight">
            <Text as="h1" variant="headingXl">
              {t("Make a Contribution")}
            </Text>
          </Stack>

          <Stack vertical spacing="tight">
            <Text as="h2" variant="headingLg">
              {t("Contribution info")}
            </Text>
            <Text as="p" variant="bodyMd">
              {t("Help us display your proposal correctly.")}
            </Text>
          </Stack>

          {resource && (
            <Stack vertical spacing="extraTight">
              <PLabel label={t("Parent repository")} />
              <ResourceDetailsCard resource={resource} />
            </Stack>
          )}

          <CreateContributionFrom onSubmit={onSubmit} error={formError} setError={setFormError} />
        </Stack>
      </div>
    </>
  );
};

//

CreateContribution.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default CreateContribution;
