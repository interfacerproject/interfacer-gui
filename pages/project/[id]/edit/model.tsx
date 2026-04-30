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
import { useProjectCRUD } from "hooks/useProjectCRUD";
import useDppApi from "lib/dpp";
import findProjectModels, { getRawMetadataModelEntries } from "lib/findProjectModels";
import { uploadModelFilesToDpp } from "lib/projectModelFiles";

type ModelMetadataEntry = string | Record<string, unknown>;

interface EditModelFilesValues {
  modelFiles: ModelFilesStepValues;
}

const SEPARATOR = " @ ";

function createToken(entry: ReturnType<typeof findProjectModels>[number], index: number): string {
  return entry.hash || entry.url || `${entry.name}-${index}`;
}

const EditModelFiles: NextPageWithLayout = () => {
  const { project } = useProject();
  const { updateMetadata } = useProjectCRUD();
  const { uploadFile: uploadDppFile } = useDppApi();

  const metadata = ((project.metadata || {}) as Record<string, unknown>) || {};
  const existingEntries = getRawMetadataModelEntries(metadata);
  const resolvedModels = findProjectModels(project);

  const existingModels = resolvedModels.map((model, index) => {
    const token = createToken(model, index);

    return {
      entry: existingEntries[index] as ModelMetadataEntry,
      file: new File([], `${model.name}${SEPARATOR}${token}`),
      token,
    };
  });

  const defaultValues: EditModelFilesValues = {
    modelFiles: existingModels.map(model => model.file),
  };

  const schema = yup.object({
    modelFiles: modelFilesStepSchema(),
  });

  const formMethods = useForm<EditModelFilesValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  function getExistingEntry(fileName: string): ModelMetadataEntry | undefined {
    const fileNameParts = fileName.split(SEPARATOR);
    const token = fileNameParts[fileNameParts.length - 1];
    return existingModels.find(model => model.token === token)?.entry;
  }

  function isExistingEntry(fileName: string): boolean {
    return Boolean(getExistingEntry(fileName));
  }

  async function onSubmit(values: EditModelFilesValues) {
    const preservedEntries = values.modelFiles
      .map(file => getExistingEntry(file.name))
      .filter((entry): entry is ModelMetadataEntry => Boolean(entry));

    const newFiles = values.modelFiles.filter(file => !isExistingEntry(file.name));
    const newEntries = await uploadModelFilesToDpp(newFiles, uploadDppFile);

    await updateMetadata(project, { models: [...preservedEntries, ...newEntries] });
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
