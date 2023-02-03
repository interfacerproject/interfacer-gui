import Layout from "components/layout/Layout";
import ImportDesign from "components/partials/create/project/ImportDesign";
import LinkDesign from "components/partials/create/project/LinkDesign";
import MainStep from "components/partials/create/project/MainStep";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

//

const CreateTest: NextPageWithLayout = () => {
  return (
    <div className="space-y-12">
      <ImportDesign />
      <LinkDesign />
      <MainStep projectType="product" />
    </div>
  );
};

//

CreateTest.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout>
      <div className="max-w-xl mx-auto p-4">{page}</div>
    </Layout>
  );
};

export default CreateTest;
