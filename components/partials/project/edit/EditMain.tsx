import { gql, useMutation } from "@apollo/client";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingOverlay from "components/LoadingOverlay";
import MainStep, { mainStepSchema, MainStepValues } from "components/partials/create/project/steps/MainStep";
import { EconomicResource, EditMainMutation, EditMainMutationVariables } from "lib/types";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import SubmitChangesBar from "./SubmitChangesBar";

//

export interface EditMainProps {
  project: Partial<EconomicResource>;
}

export interface EditMainValues {
  main: MainStepValues;
}

export default function EditMain({ project }: EditMainProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const [editMainMutation] = useMutation<EditMainMutation, EditMainMutationVariables>(EDIT_MAIN);

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
  const { handleSubmit, formState, watch } = formMethods;
  const { isValid, errors } = formState;

  const [loading, setLoading] = useState(false);

  function convertValues(values: EditMainValues): EditMainMutationVariables {
    return {
      id: project.id!,
      name: values.main.title,
      note: values.main.description,
      classifiedAs: values.main.tags,
    };
  }

  async function onSubmit(values: EditMainValues) {
    setLoading(true);
    await editMainMutation({ variables: convertValues(values) });
    router.reload();
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <SubmitChangesBar />

        <div className="mx-auto max-w-xl p-6 pb-24">
          <MainStep />
        </div>
      </form>

      {loading && <LoadingOverlay />}
    </FormProvider>
  );
}

//

export const EDIT_MAIN = gql`
  mutation EditMain($id: ID!, $classifiedAs: [URI!], $note: String, $name: String) {
    updateEconomicResource(resource: { id: $id, classifiedAs: $classifiedAs, name: $name, note: $note }) {
      economicResource {
        id
      }
    }
  }
`;
