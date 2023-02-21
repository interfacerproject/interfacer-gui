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

  // const [editMainMutation] = useMutation<EditMainMutation, EditMainMutationVariables>(EDIT_MAIN);

  function valuesToVariables(values: EditRelationsValues) {
    // const classifiedAs = values.main.tags.length ? values.main.tags : undefined;
    // return {
    //   id: project.id!,
    //   name: values.main.title,
    //   note: values.main.description,
    //   repo: values.main.link,
    //   classifiedAs,
    // };
  }

  async function onSubmit(values: EditRelationsValues) {
    console.log(values);
    // await editMainMutation({ variables: valuesToVariables(values) });
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
  <Layout>
    <FetchProjectLayout>
      <EditProjectLayout>{page}</EditProjectLayout>
    </FetchProjectLayout>
  </Layout>
);

export default EditMain;
