import { Card } from "@bbtgnn/polaris-interfacer";
import Layout from "components/layout/Layout";
import ContributorsStep from "components/partials/create/project/ContributorsStep";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

//

const CreateTest: NextPageWithLayout = () => {
  return (
    <Card sectioned>
      <ContributorsStep />
    </Card>
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
