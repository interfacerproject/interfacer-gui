import { Card, Icon, Stack } from "@bbtgnn/polaris-interfacer";
import { ReferralMajor } from "@shopify/polaris-icons";
import Layout from "components/layout/Layout";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "pages/_app";
import React, { ReactElement } from "react";

//

const CreateProject: NextPageWithLayout = () => {
  const { t } = useTranslation();

  const sections: Array<{ title: string; description: string; icon: React.ReactNode; url: string }> = [
    {
      title: t("Design"),
      description: t("A digital project, like an open source hardware project or 3D model"),
      url: "/create/project/design",
      icon: <Icon source={ReferralMajor} />,
    },
    {
      title: t("Product"),
      description: t("A physical product that can be picked up or delivered"),
      url: "/create/project/product",
      icon: <Icon source={ReferralMajor} />,
    },
    {
      title: t("Service"),
      description: t("A service, like a consultancy, training course or usage/rental of equipment"),
      url: "/create/project/service",
      icon: <Icon source={ReferralMajor} />,
    },
  ];

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle title={t("Create a new Project")} subtitle={t("Make sure you read the Community Guidelines.")} />
      <Stack vertical>
        {sections.map(s => (
          <Card key={s.url}>
            <div className="flex flex-row flex-nowrap p-6">
              <div className="w-20">{s.icon}</div>
              <PTitleSubtitle title={s.title} subtitle={s.description} titleTag="h2" />
            </div>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
};

//

CreateProject.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout>
      <div className="max-w-xl mx-auto p-4">{page}</div>
    </Layout>
  );
};

export default CreateProject;
