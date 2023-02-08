import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

// Components
import CreateProjectLayout from "components/layout/CreateProjectLayout";
import Layout from "components/layout/Layout";
import CreateProjectForm from "components/partials/create/project/CreateProjectForm";

//

const CreateDesign: NextPageWithLayout = () => {
  return <CreateProjectForm projectType="design" />;
};

//

CreateDesign.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout>
      <CreateProjectLayout projectType="design">{page}</CreateProjectLayout>
    </Layout>
  );
};

export default CreateDesign;
