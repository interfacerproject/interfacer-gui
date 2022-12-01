import { Card, Stack, Text } from "@bbtgnn/polaris-interfacer";
import CreateContributionFrom from "components/partials/create/contribution/CreateContributionForm";
import PLabel from "components/polaris/PLabel";
import ResourceDetailsCard from "components/ResourceDetailsCard";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement, useState } from "react";

// Request
import { useQuery } from "@apollo/client";
import { GET_RESOURCE_DETAILS } from "lib/QueryAndMutation";
import { EconomicResource, GetResourceDetailsQuery, GetResourceDetailsQueryVariables } from "lib/types";

//

const CreateContribution: NextPageWithLayout = () => {
  const { t } = useTranslation("CreateContributionProps");
  const [formError, setFormError] = useState("");

  const router = useRouter();
  const { resourceID } = router.query;
  const id = resourceID?.toString() || "";

  const { data, error } = useQuery<GetResourceDetailsQuery, GetResourceDetailsQueryVariables>(GET_RESOURCE_DETAILS, {
    variables: { id },
  });

  const resource = data?.proposal?.primaryIntents![0].resourceInventoriedAs as EconomicResource;

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
      <Stack vertical spacing="extraLoose">
        <Stack vertical spacing="tight">
          <Text as="h1" variant="headingXl">
            {t("Make a Contribution")}
          </Text>
          <Text as="p" variant="bodyMd">
            {t("Lorem ipsum sic dolor amet")}
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

        <CreateContributionFrom onSubmit={() => {}} error={formError} setError={setFormError} />
      </Stack>
    </>
  );
};

//

CreateContribution.getLayout = function getLayout(page: ReactElement) {
  return <div className="mx-auto max-w-lg p-6">{page}</div>;
};

export default CreateContribution;
