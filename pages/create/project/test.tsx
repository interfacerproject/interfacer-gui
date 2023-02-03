import Layout from "components/layout/Layout";
import ContributorsStep from "components/partials/create/project/ContributorsStep";
import DeclarationsStep from "components/partials/create/project/DeclarationsStep";
import ImagesStep from "components/partials/create/project/ImagesStep";
import RelationsStep from "components/partials/create/project/RelationsStep";
import LocationStep from "components/partials/create/project/LocationStep";
import LicenseStep from "components/partials/create/project/LicenseStep";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

//

const CreateTest: NextPageWithLayout = () => {
  return (
    <div className="space-y-12">
      <ImagesStep />
      <LicenseStep />
      <LocationStep projectType="product" />
      <RelationsStep />
      <DeclarationsStep />
      <ContributorsStep />
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
