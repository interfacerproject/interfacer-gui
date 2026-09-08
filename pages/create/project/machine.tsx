import { ProjectType } from "components/types";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

// Components
import CreateFormLayout from "components/layout/CreateFormLayout";
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

const CreateMachine: NextPageWithLayout = () => {
  return <CreateProjectForm projectType={ProjectType.MACHINE} />;
};

//

CreateMachine.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout bottomPadding="none">
      <CreateFormLayout>{page}</CreateFormLayout>
    </Layout>
  );
};

export default CreateMachine;
