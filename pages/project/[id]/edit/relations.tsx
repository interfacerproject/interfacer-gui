import { useProjectCRUD } from "hooks/useProjectCRUD";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "pages/_app";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import RelationsStep, {
  relationsStepSchema,
  RelationsStepValues,
} from "components/partials/create/project/steps/RelationsStep";
import { useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import EditProjectLayout from "components/layout/EditProjectLayout";
import FetchProjectLayout, { useProject } from "components/layout/FetchProjectLayout";
import Layout from "components/layout/Layout";
import EditFormLayout from "components/partials/project/edit/EditFormLayout";
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

export interface EditRelationsValues {
  relations: RelationsStepValues;
}

const EditMain: NextPageWithLayout = () => {
  const project = useProject();

  /* Form setup */

  const defaultValues: EditRelationsValues = {
    relations: project.metadata.relations || [],
  };

  const schema = yup.object({
    relations: relationsStepSchema,
  });

  const formMethods = useForm<EditRelationsValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  /* Submit logic */

  const { updateRelations } = useProjectCRUD();

  async function onSubmit(values: EditRelationsValues) {
    await updateRelations(project.id!, values.relations);
  }

  /* Render */

  return (
    <EditFormLayout formMethods={formMethods} onSubmit={onSubmit}>
      <RelationsStep />
    </EditFormLayout>
  );
};

//

EditMain.getLayout = page => (
  <Layout bottomPadding="none">
    <FetchProjectLayout>
      <EditProjectLayout>{page}</EditProjectLayout>
    </FetchProjectLayout>
  </Layout>
);

export default EditMain;
