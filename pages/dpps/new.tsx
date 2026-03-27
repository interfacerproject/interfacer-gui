import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

import Layout from "components/layout/Layout";
import CreateDppForm from "components/partials/create/dpp/CreateDppForm";

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, ["common", "createProjectProps"])),
    },
  };
}

const CreateDpp: NextPageWithLayout = () => {
  return <CreateDppForm />;
};

CreateDpp.getLayout = function getLayout(page: ReactElement) {
  return <Layout bottomPadding="none">{page}</Layout>;
};

export default CreateDpp;
