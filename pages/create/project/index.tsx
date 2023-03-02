import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

// Components
import { Card, Icon, Stack } from "@bbtgnn/polaris-interfacer";
import { ChevronRightMinor } from "@shopify/polaris-icons";
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
  const { t } = useTranslation(["common", "createProjectProps"]);

  const sections: Array<{ title: string; description: string; icon: string; url: string }> = [
    {
      title: t("Design"),
      description: t(
        "Import your project repository. Share your open source hardware project documentation and collaborate on building it."
      ),
      url: "/create/project/design",
      icon: DesignIcon.src,
    },
    {
      title: t("Product"),
      description: t(
        "Showcase your open source hardware product and connect with a global network of makers. Import your product details to our platform."
      ),
      url: "/create/project/product",
      icon: ProductIcon.src,
    },
    {
      title: t("Services"),
      description: t(
        "Offer your expertise, training courses, or equipment rentals on our platform, supporting the development and collaboration of open source hardware projects in the community."
      ),
      url: "/create/project/service",
      icon: ServiceIcon.src,
    },
  ];

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle
        title={t("Submit a new project")}
        subtitle={
          <>
            {t(
              "Submit your new open source hardware project and ensure that all relevant information is included. This information will be used to identify your project and provide context to users who may be interested in it."
            )}
            <br />
            <br />
            {t("Need help? Read the User Guide to get started.")}
            <a
              className="ml-1 text-text-primary hover:underline"
              target="_blank"
              rel="noreferrer"
              href="https://interfacerproject.github.io/interfacer-docs/#/pages/user-manual/quickstart?id=projects"
            >
              {"[↗]"}
            </a>
          </>
        }
      />
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
                  <Icon color="primary" source={ChevronRightMinor} />
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
