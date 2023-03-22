import { ProjectType } from "components/types";
import { useProjectCRUD } from "hooks/useProjectCRUD";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "pages/_app";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import LocationStep, {
  locationStepSchema,
  LocationStepSchemaContext,
  LocationStepValues,
} from "components/partials/create/project/steps/LocationStep";
import { useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import EditProjectLayout from "components/layout/EditProjectLayout";
import FetchProjectLayout, { useProject } from "components/layout/FetchProjectLayout";
import Layout from "components/layout/Layout";
import EditFormLayout from "components/partials/project/edit/EditFormLayout";
import { SelectedLocation } from "components/SelectLocation2";
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

export interface EditLocationValues {
  location: LocationStepValues;
}

const EditLocation: NextPageWithLayout = () => {
  const { project } = useProject();
  const projectType = project?.conformsTo?.name as ProjectType.PRODUCT | ProjectType.SERVICE;

  /* Form setup */

  const defaultLocationData: SelectedLocation = {
    address: project?.currentLocation?.mappableAddress!,
    lat: project?.currentLocation?.lat,
    lng: project?.currentLocation?.long,
  };

  const defaultLocationExists = Boolean(project?.currentLocation);

  const defaultValues: EditLocationValues = {
    location: {
      locationName: project?.currentLocation?.name || "",
      locationData: defaultLocationExists ? defaultLocationData : null,
      remote: project?.metadata?.remote || false,
    },
  };

  const schema = yup.object({
    location: locationStepSchema,
  });

  const formMethods = useForm<EditLocationValues, LocationStepSchemaContext>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
    context: {
      projectType,
      isEdit: true,
    },
  });

  /* Submit logic */

  const { relocateProject } = useProjectCRUD();

  async function onSubmit(values: EditLocationValues) {
    await relocateProject(project.id!, values.location);
  }

  /* Render */

  return (
    <EditFormLayout formMethods={formMethods} onSubmit={onSubmit}>
      <LocationStep projectType={projectType} isEdit />
    </EditFormLayout>
  );
};

//

EditLocation.getLayout = page => (
  <Layout bottomPadding="none">
    <FetchProjectLayout>
      <EditProjectLayout>{page}</EditProjectLayout>
    </FetchProjectLayout>
  </Layout>
);

export default EditLocation;
