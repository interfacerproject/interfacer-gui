import { gql, useMutation } from "@apollo/client";
import { yupResolver } from "@hookform/resolvers/yup";
import MainStep, { mainStepSchema, MainStepValues } from "components/partials/create/project/steps/MainStep";
import { EconomicResource, EditMainMutation, EditMainMutationVariables } from "lib/types";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import EditFormLayout from "./EditFormLayout";

//

export interface EditMainProps {
  project: Partial<EconomicResource>;
}

export interface EditMainValues {
  main: MainStepValues;
}

//

export default function EditMain({ project }: EditMainProps) {
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
    return {
      id: project.id!,
      name: values.main.title,
      note: values.main.description,
      repo: values.main.link,
      classifiedAs: values.main.tags,
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
}

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
