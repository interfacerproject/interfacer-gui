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

  // const [editMainMutation] = useMutation<EditMainMutation, EditMainMutationVariables>(EDIT_MAIN);

  function valuesToVariables(values: EditContributorsValues) {
    // const classifiedAs = values.main.tags.length ? values.main.tags : undefined;
    // return {
    //   id: project.id!,
    //   name: values.main.title,
    //   note: values.main.description,
    //   repo: values.main.link,
    //   classifiedAs,
    // };
  }

  async function onSubmit(values: EditContributorsValues) {
    console.log(values);
    // await editMainMutation({ variables: valuesToVariables(values) });
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
