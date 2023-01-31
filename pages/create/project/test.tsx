import Layout from "components/layout/Layout";
import RelationsStep from "components/partials/create/project/RelationsStep";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

//

const CreateTest: NextPageWithLayout = () => {
  return (
    <>
      <RelationsStep />
    </>
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
