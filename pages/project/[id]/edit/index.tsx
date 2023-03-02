import { gql, useMutation } from "@apollo/client";
import { EditMainMutation, EditMainMutationVariables } from "lib/types";
import { NextPageWithLayout } from "pages/_app";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import MainStep, { mainStepSchema, MainStepValues } from "components/partials/create/project/steps/MainStep";
import { useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import EditProjectLayout from "components/layout/EditProjectLayout";
import FetchProjectLayout, { useProject } from "components/layout/FetchProjectLayout";
import Layout from "components/layout/Layout";
import EditFormLayout from "components/partials/project/edit/EditFormLayout";

//

export interface EditMainValues {
  main: MainStepValues;
}

const EditMain: NextPageWithLayout = () => {
  const project = useProject();

  /* Form setup */

  const defaultValues: EditMainValues = {
    main: {
      title: project.name || "",
      description: project.note || "",
      link: project.repo || "",
      tags: project.classifiedAs || [],
    },
  };

  const schema = yup.object({
    main: mainStepSchema,
  });

  const formMethods = useForm<EditMainValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  /* Submit logic */

  const [editMainMutation] = useMutation<EditMainMutation, EditMainMutationVariables>(EDIT_MAIN);

  function valuesToVariables(values: EditMainValues): EditMainMutationVariables {
    const classifiedAs = values.main.tags.length ? values.main.tags : undefined;
    return {
      id: project.id!,
      name: values.main.title,
      note: values.main.description,
      repo: values.main.link,
      classifiedAs,
    };
  }

  async function onSubmit(values: EditMainValues) {
    await editMainMutation({ variables: valuesToVariables(values) });
  }

  /* Render */

  return (
    <EditFormLayout formMethods={formMethods} onSubmit={onSubmit}>
      <MainStep />
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

//

export const EDIT_MAIN = gql`
  mutation EditMain($id: ID!, $classifiedAs: [URI!], $note: String, $name: String, $repo: String) {
    updateEconomicResource(resource: { id: $id, classifiedAs: $classifiedAs, name: $name, note: $note, repo: $repo }) {
      economicResource {
        id
      }
    }
  }
`;
