import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

// Components
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
      <div className="max-w-xl mx-auto p-4">{page}</div>
    </Layout>
  );
};

export default CreateService;
