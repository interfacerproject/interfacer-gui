import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement, useState } from "react";

// Components
import { Banner, Card, Icon, OptionList, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { ChevronRightMinor } from "@shopify/polaris-icons";
import Layout from "components/layout/Layout";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import ProjectTypeRoundIcon from "components/ProjectTypeRoundIcon";

// Icons
import { SectionDescriptor } from "@bbtgnn/polaris-interfacer/build/ts/latest/src/types";
import FullWidthBanner from "components/FullWidthBanner";
import { ProjectType } from "components/types";
import useFormSaveDraft from "hooks/useFormSaveDraft";
import Link from "next/link";
import { useRouter } from "next/router";

//

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, ["createProjectProps", "common"])),
    },
  };
}

//

const CreateProject: NextPageWithLayout = () => {
  const { t } = useTranslation(["createProjectProps", "common"]);
  const { draftsSaved } = useFormSaveDraft();
  const router = useRouter();
  const { draft_deleted } = router.query;
  const [isOpenBanner, setIsOpenBanner] = useState(!!draft_deleted);
  const draftSections = draftsSaved?.reduce((acc, draft) => {
    const draftName = draft.split("-")[3];
    const sectionTitle = draft.split("-")[2];
    const section = acc.find(section => section.title === sectionTitle);
    if (section) {
      section.options.push({ label: draftName, value: draft });
    } else {
      acc.push({ title: sectionTitle, options: [{ label: draftName, value: draft }] });
    }
    return acc;
  }, [] as SectionDescriptor[]);

  const sections: Array<{ title: string; description: string; url: string; projectType: ProjectType }> = [
    {
      title: t("Design"),
      description: t(
        "Import your project repository. Share your open source hardware project documentation and collaborate on building it."
      ),
      url: "/create/project/design",
      projectType: ProjectType.DESIGN,
    },
    {
      title: t("Product"),
      description: t(
        "Showcase your open source hardware product and connect with a global network of makers. Import your product details to our platform."
      ),
      url: "/create/project/product",
      projectType: ProjectType.PRODUCT,
    },
    {
      title: t("Services"),
      description: t(
        "Offer your expertise, training courses, or equipment rentals on our platform, supporting the development and collaboration of open source hardware projects in the community."
      ),
      url: "/create/project/service",
      projectType: ProjectType.SERVICE,
    },
  ];

  return (
    <>
      <FullWidthBanner open={isOpenBanner} onClose={() => setIsOpenBanner(false)} status="info">
        <Text as="p" variant="bodySm">
          {t("Your draft project was deleted")}
        </Text>
      </FullWidthBanner>
      <div className="max-w-xl mx-auto p-4">
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
            {draftsSaved && (
              <Banner status="info" title={t("You have some draft saved") + ":"}>
                <OptionList
                  onChange={d => {
                    console.log(d);
                    router.push(`/create/project/${d[0].split("-")[2]}?draft_name=${d[0]}`);
                  }}
                  sections={draftSections}
                  selected={[]}
                />
              </Banner>
            )}
            {sections.map(s => (
              <Card key={s.url}>
                <Link href={s.url}>
                  <div
                    id={`create-${s.title.toLowerCase()}-button`}
                    className="
                flex flex-row flex-nowrap items-center p-6 rounded-lg space-x-4
                hover:cursor-pointer hover:outline hover:outline-2 hover:outline-primary"
                  >
                    <ProjectTypeRoundIcon projectType={s.projectType} />
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
      </div>
    </>
  );
};

//

CreateProject.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default CreateProject;
