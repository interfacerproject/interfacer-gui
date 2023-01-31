import Layout from "components/layout/Layout";
import DeclarationsStep from "components/partials/create/project/DeclarationsStep";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

//

const CreateTest: NextPageWithLayout = () => {
  return (
    <>
      <DeclarationsStep />
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
