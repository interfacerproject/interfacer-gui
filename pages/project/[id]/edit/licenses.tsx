import { NextPageWithLayout } from "pages/_app";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import LicenseStep, {
  licenseStepSchema,
  LicenseStepValues,
} from "components/partials/create/project/steps/LicenseStep";
import { useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import EditProjectLayout from "components/layout/EditProjectLayout";
import FetchProjectLayout, { useProject } from "components/layout/FetchProjectLayout";
import Layout from "components/layout/Layout";
import EditFormLayout from "components/partials/project/edit/EditFormLayout";
import { useProjectCRUD } from "hooks/useProjectCRUD";

//

export interface EditLicensesValues {
  licenses: LicenseStepValues;
}

const EditLicenses: NextPageWithLayout = () => {
  const project = useProject();

  /* Form setup */

  const defaultValues: EditLicensesValues = {
    licenses: project.metadata.licenses || [],
  };

  const schema = yup.object({
    licenses: licenseStepSchema,
  });

  const formMethods = useForm<EditLicensesValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  /* Submit logic */

  const { updateLicenses } = useProjectCRUD();

  async function onSubmit(values: EditLicensesValues) {
    await updateLicenses(project.id!, values.licenses);
  }

  /* Render */

  return (
    <EditFormLayout formMethods={formMethods} onSubmit={onSubmit}>
      <LicenseStep />
    </EditFormLayout>
  );
};

//

EditLicenses.getLayout = page => (
  <Layout>
    <FetchProjectLayout>
      <EditProjectLayout>{page}</EditProjectLayout>
    </FetchProjectLayout>
  </Layout>
);

export default EditLicenses;
