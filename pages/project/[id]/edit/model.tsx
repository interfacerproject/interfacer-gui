import { yupResolver } from "@hookform/resolvers/yup";
import { GetStaticPaths } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "pages/_app";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import EditProjectLayout from "components/layout/EditProjectLayout";
import FetchProjectLayout, { useProject } from "components/layout/FetchProjectLayout";
import Layout from "components/layout/Layout";
import ModelFilesStep, {
  modelFilesStepSchema,
  ModelFilesStepValues,
} from "components/partials/create/project/steps/ModelFilesStep";
import EditFormLayout from "components/partials/project/edit/EditFormLayout";
import { useMetadataDraft } from "hooks/useMetadataDraft";
import findProjectModels, { getRawMetadataModelEntries } from "lib/findProjectModels";

interface EditModelFilesValues {
  modelFiles: ModelFilesStepValues;
}

const EditModelFiles: NextPageWithLayout = () => {
  const { project } = useProject();
  // Saves against the values this form opened with (same-field conflicts are surfaced).
  const { save } = useMetadataDraft(project);

  const metadata = ((project.metadata || {}) as Record<string, unknown>) || {};
  const existingEntries = getRawMetadataModelEntries(metadata);
  const resolvedModels = findProjectModels(project);

  // Map existing models to {url} entries
  const existingModelUrls: ModelFilesStepValues = resolvedModels.map(model => ({
    url: model.url,
  }));

  const defaultValues: EditModelFilesValues = {
    modelFiles: existingModelUrls,
  };

  const schema = yup.object({
    modelFiles: modelFilesStepSchema(),
  });

  const formMethods = useForm<EditModelFilesValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  async function onSubmit(values: EditModelFilesValues) {
    const newModelUrls = (values.modelFiles || []).map(m => m.url?.trim()).filter((url): url is string => Boolean(url));

    // Preserve any existing non-URL entries (e.g. DPP-stored files)
    const preservedEntries = existingEntries.filter(entry => typeof entry !== "string");

    await save({
      models: [...preservedEntries, ...newModelUrls],
    });
  }

  return (
    <EditFormLayout formMethods={formMethods} onSubmit={onSubmit}>
      <ModelFilesStep />
    </EditFormLayout>
  );
};

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

EditModelFiles.getLayout = page => (
  <Layout bottomPadding="none">
    <FetchProjectLayout>
      <EditProjectLayout>{page}</EditProjectLayout>
    </FetchProjectLayout>
  </Layout>
);

export default EditModelFiles;
