import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

// Components
import CreateProjectLayout from "components/layout/CreateProjectLayout";
import Layout from "components/layout/Layout";
import CreateProjectForm from "components/partials/create/project/CreateProjectForm";

//

const CreateProduct: NextPageWithLayout = () => {
  return <CreateProjectForm projectType="product" />;
};

//

CreateProduct.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout>
      <CreateProjectLayout projectType="product">{page}</CreateProjectLayout>
    </Layout>
  );
};

export default CreateProduct;
