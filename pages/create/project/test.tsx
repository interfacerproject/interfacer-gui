import { Card } from "@bbtgnn/polaris-interfacer";
import Layout from "components/layout/Layout";
import ContributorsStep from "components/partials/create/project/ContributorsStep";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

//

const CreateTest: NextPageWithLayout = () => {
  return (
    <div>
      <div className=" max-w-lg mx-auto">
        <Card sectioned>
          <ContributorsStep />
        </Card>
      </div>
    </div>
  );
};

//

CreateTest.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default CreateTest;
