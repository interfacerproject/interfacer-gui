import { NextPageWithLayout } from "pages/_app";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import DeclarationsStep, {
  declarationsStepDefaultValues,
  declarationsStepSchema,
  DeclarationsStepValues,
} from "components/partials/create/project/steps/DeclarationsStep";
import { useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import EditProjectLayout from "components/layout/EditProjectLayout";
import FetchProjectLayout, { useProject } from "components/layout/FetchProjectLayout";
import Layout from "components/layout/Layout";
import EditFormLayout from "components/partials/project/edit/EditFormLayout";
import { useProjectCRUD } from "hooks/useProjectCRUD";

//

export interface EditDeclarationsValues {
  declarations: DeclarationsStepValues;
}

const EditDeclarations: NextPageWithLayout = () => {
  const project = useProject();

  /* Form setup */

  const defaultValues: EditDeclarationsValues = {
    declarations: project.metadata.declarations || declarationsStepDefaultValues,
  };

  const schema = yup.object({
    declarations: declarationsStepSchema,
  });

  const formMethods = useForm<EditDeclarationsValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  /* Submit logic */

  const { updateDeclarations } = useProjectCRUD();

  async function onSubmit(values: EditDeclarationsValues) {
    await updateDeclarations(project.id!, values.declarations);
  }

  /* Render */

  return (
    <EditFormLayout formMethods={formMethods} onSubmit={onSubmit}>
      <DeclarationsStep />
    </EditFormLayout>
  );
};

//

EditDeclarations.getLayout = page => (
  <Layout bottomPadding="none">
    <FetchProjectLayout>
      <EditProjectLayout>{page}</EditProjectLayout>
    </FetchProjectLayout>
  </Layout>
);

export default EditDeclarations;
