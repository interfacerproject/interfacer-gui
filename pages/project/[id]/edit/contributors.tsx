import { NextPageWithLayout } from "pages/_app";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import ContributorsStep, {
  contributorsStepSchema,
  ContributorsStepValues,
} from "components/partials/create/project/steps/ContributorsStep";
import { useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import EditProjectLayout from "components/layout/EditProjectLayout";
import FetchProjectLayout, { useProject } from "components/layout/FetchProjectLayout";
import Layout from "components/layout/Layout";
import EditFormLayout from "components/partials/project/edit/EditFormLayout";
import { useProjectCRUD } from "hooks/useProjectCRUD";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticPaths } from "next";

//
export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, ["common", "createProjectProps"])),
    },
  };
}

//

export interface EditContributorsValues {
  contributors: ContributorsStepValues;
}

const EditContributors: NextPageWithLayout = () => {
  const project = useProject();

  /* Form setup */

  const defaultValues: EditContributorsValues = {
    contributors: project.metadata.contributors || [],
  };

  const schema = yup.object({
    contributors: contributorsStepSchema,
  });

  const formMethods = useForm<EditContributorsValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  /* Submit logic */

  const { updateContributors } = useProjectCRUD();

  async function onSubmit(values: EditContributorsValues) {
    await updateContributors(project.id!, values.contributors);
  }

  /* Render */

  return (
    <EditFormLayout formMethods={formMethods} onSubmit={onSubmit}>
      <ContributorsStep />
    </EditFormLayout>
  );
};

//

EditContributors.getLayout = page => (
  <Layout>
    <FetchProjectLayout>
      <EditProjectLayout>{page}</EditProjectLayout>
    </FetchProjectLayout>
  </Layout>
);

export default EditContributors;
