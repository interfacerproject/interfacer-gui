import FetchProjectLayout, { useProject } from "components/layout/FetchProjectLayout";
import Layout from "components/layout/Layout";
import ProjectMap from "components/ProjectMap";
import { NextPageWithLayout } from "pages/_app";

const ShowProjectMap: NextPageWithLayout = () => {
  const { project } = useProject();
  console.log("ShowProjectMap", project);
  return (
    <div className="container mx-auto px-2 lg:px-0 mt-2">
      <ProjectMap project={project} />
    </div>
  );
};

ShowProjectMap.getLayout = page => {
  return (
    <Layout>
      <FetchProjectLayout>{page}</FetchProjectLayout>
    </Layout>
  );
};

export default ShowProjectMap;
