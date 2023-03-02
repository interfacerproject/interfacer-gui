import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

// Components
import { Card, Icon, Stack } from "@bbtgnn/polaris-interfacer";
import { ArrowRightMinor } from "@shopify/polaris-icons";
import Layout from "components/layout/Layout";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";

// Icons
import Link from "next/link";
import DesignIcon from "public/project-icons/design.svg";
import ProductIcon from "public/project-icons/product.svg";
import ServiceIcon from "public/project-icons/service.svg";

//

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, ["common", "createProjectProps"])),
    },
  };
}

//

const CreateProject: NextPageWithLayout = () => {
  const { t } = useTranslation();

  const sections: Array<{ title: string; description: string; icon: string; url: string }> = [
    {
      title: t("Design"),
      description: t("A digital project, like an open source hardware project or 3D model"),
      url: "/create/project/design",
      icon: DesignIcon.src,
    },
    {
      title: t("Product"),
      description: t("A physical product that can be picked up or delivered"),
      url: "/create/project/product",
      icon: ProductIcon.src,
    },
    {
      title: t("Service"),
      description: t("A service, like a consultancy, training course or usage/rental of equipment"),
      url: "/create/project/service",
      icon: ServiceIcon.src,
    },
  ];

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle title={t("Create a new Project")} subtitle={t("Make sure you read the Community Guidelines.")} />
      <Stack vertical>
        {sections.map(s => (
          <Card key={s.url}>
            <Link href={s.url}>
              <div
                className="
                flex flex-row flex-nowrap items-center p-6 rounded-lg
                hover:cursor-pointer hover:outline hover:outline-2 hover:outline-primary"
              >
                <img className="mr-6" src={s.icon} alt={`${s.title} icon`} />
                <div className="grow">
                  <PTitleSubtitle title={s.title} subtitle={s.description} titleTag="h2" />
                </div>
                <div className="ml-6">
                  <Icon color="subdued" source={ArrowRightMinor} />
                </div>
              </div>
            </Link>
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
