import { useRouter } from "next/router";
import { useMutation, useQuery } from "@apollo/client";
import { ACCEPT_PROPOSAL, QUERY_PROPOSAL, QUERY_UNIT_AND_CURRENCY, SATISFY_INTENTS } from "../../lib/QueryAndMutation";
import { Stack, Text, Button } from "@bbtgnn/polaris-interfacer";
import PLabel from "../../components/polaris/PLabel";
import ResourceDetailsCard from "../../components/ResourceDetailsCard";
import { useTranslation } from "next-i18next";
import Spinner from "../../components/brickroom/Spinner";
import devLog from "../../lib/devLog";
import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { GetUnitAndCurrencyQuery } from "../../lib/types";

const Proposal = () => {
  const router = useRouter();
  const { t } = useTranslation("proposalProps");
  const { id } = router.query;
  const { user } = useAuth();
  const { data, loading } = useQuery(QUERY_PROPOSAL, { variables: { id: id?.toString() || "" } });

  const unitAndCurrency = useQuery<GetUnitAndCurrencyQuery>(QUERY_UNIT_AND_CURRENCY).data?.instanceVariables;
  const [acceptProposal] = useMutation(ACCEPT_PROPOSAL);
  const [satisfyIntents] = useMutation(SATISFY_INTENTS);

  const proposal = data?.proposal;
  devLog("proposal", proposal);

  const onAccept = async () => {
    const acceptanceVariables = {
      process: proposal.primaryIntents[0].inputOf.id,
      agent: user!.ulid,
      unitOne: unitAndCurrency?.units.unitOne.id!,
      resourceForked: proposal?.primaryIntents[0].resourceInventoriedAs.id,
      resourceOrigin: proposal?.primaryIntents[1].resourceInventoriedAs.id,
      creationTime: new Date().toISOString(),
    };
    devLog("acceptanceVariables", acceptanceVariables);
    const economicEvents = await acceptProposal({ variables: acceptanceVariables });
    devLog("economicEvents created", economicEvents);

    const satisfyIntentsVariables = {
      unitOne: unitAndCurrency?.units.unitOne.id!,
      intentCited: proposal?.primaryIntents[0].id,
      intentAccepted: proposal?.primaryIntents[1].id,
      intentModify: proposal?.primaryIntents[2].id,
      eventCite: economicEvents.data.cite.economicEvent.it,
      eventAccept: economicEvents.data.accept.economicEvent.it,
      eventModify: economicEvents.data.modify.economicEvent.it,
    };
    devLog("satisfyIntentsVariables", satisfyIntentsVariables);
    const intentsSatisfied = await satisfyIntents({ variables: satisfyIntentsVariables });
    devLog("intentsSatisfied created", intentsSatisfied);
  };

  return (
    <div className="mx-auto max-w-lg p-6">
      {loading ? (
        <Spinner />
      ) : (
        <>
          <Stack vertical spacing="extraLoose">
            <Stack vertical spacing="tight">
              <Text as="h1" variant="headingXl">
                {t("Contribution from ")} {proposal.primaryIntents[0].receiver.name}
              </Text>
            </Stack>

            <Stack vertical spacing="extraTight">
              <PLabel label={t("Forked asset")} />
              <ResourceDetailsCard resource={data?.proposal.primaryIntents[0].resourceInventoriedAs} />
            </Stack>

            <Stack vertical spacing="tight">
              <Text as="h2" variant="headingLg">
                {t("Status")}
              </Text>
              <Text as="p" variant="bodyMd">
                {t("Waiting for approval")}
              </Text>
            </Stack>

            <Stack vertical spacing="tight">
              <Text as="h2" variant="headingLg">
                {t("Contribution info")}
              </Text>
              <Text as="p" variant="bodyMd">
                {proposal.note}
              </Text>
            </Stack>

            <Stack vertical spacing="tight">
              <Text as="h2" variant="headingLg">
                {t("Repository link")}
              </Text>
              <Text as="p" variant="bodyMd">
                {proposal.primaryIntents[0].resourceInventoriedAs.repo}
              </Text>
            </Stack>

            <Stack vertical spacing="tight">
              <Text as="h2" variant="headingLg">
                {t("Proposed Income")}
              </Text>
              {/*<Text as="p" variant="bodyMd">*/}
              {/*  {proposal.primaryIntents[1]?.resourceInventoriedAs.onhandQuantity.numericValue}*/}
              {/*</Text>*/}
            </Stack>

            <Stack vertical spacing="tight">
              <Text as="h2" variant="headingLg">
                {t("Your actions")}
              </Text>
              <Button size="large" primary fullWidth submit disabled={true} id="submit">
                {t("Reject contribution")}
              </Button>{" "}
              <Button size="large" primary fullWidth submit onClick={onAccept} id="submit">
                {t("Accept contribution")}
              </Button>
            </Stack>

            {/*<CreateContributionFrom onSubmit={onSubmit} error={formError} setError={setFormError} />*/}
          </Stack>
        </>
      )}
    </div>
  );
};

export default Proposal;
