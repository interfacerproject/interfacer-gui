import { Stack, Text } from "@bbtgnn/polaris-interfacer";
import CreateContributionFrom from "components/partials/create/contribution/CreateContributionForm";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement, useState } from "react";
//

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["CreateContributionProps"])),
    },
  };
}

//

const CreateContribution: NextPageWithLayout = () => {
  const router = useRouter();
  const { resourceID } = router.query;
  const { t } = useTranslation("CreateContributionProps");
  const [error, setError] = useState("");

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

        <CreateContributionFrom onSubmit={() => {}} error={error} setError={setError} />
      </Stack>
    </>
  );
};

//

CreateContribution.getLayout = function getLayout(page: ReactElement) {
  return <div className="mx-auto max-w-lg p-6">{page}</div>;
};

export default CreateContribution;
