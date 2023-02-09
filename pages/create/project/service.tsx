import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

// Components
import CreateProjectLayout from "components/layout/CreateProjectLayout";
import Layout from "components/layout/Layout";
import CreateProjectForm from "components/partials/create/project/CreateProjectForm";

//

const CreateService: NextPageWithLayout = () => {
  return <CreateProjectForm projectType="service" />;
};

//

CreateService.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout>
      <CreateProjectLayout projectType="service">{page}</CreateProjectLayout>
    </Layout>
  );
};

export default CreateService;
