import { ProjectType } from "components/types";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

// Components
import CreateProjectLayout from "components/layout/CreateProjectLayout";
import Layout from "components/layout/Layout";
import CreateProjectForm from "components/partials/create/project/CreateProjectForm";

//

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, ["common", "createProjectProps"])),
    },
  };
}

const CreateService: NextPageWithLayout = () => {
  return <CreateProjectForm projectType={ProjectType.SERVICE} />;
};

//

CreateService.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout bottomPadding="none">
      <CreateProjectLayout>{page}</CreateProjectLayout>
    </Layout>
  );
};

export default CreateService;
