import { Button } from "@bbtgnn/polaris-interfacer";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingOverlay from "components/LoadingOverlay";
import MainStep, { mainStepSchema, MainStepValues } from "components/partials/create/project/steps/MainStep";
import SearchTags from "components/SearchTags";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

//

export interface EditMainProps {
  project: Partial<EconomicResource>;
}

export interface EditMainValues {
  main: MainStepValues;
}

export default function EditMain({ project }: EditMainProps) {
  const { t } = useTranslation();

  console.log(project);

  const defaultValues: EditMainValues = {
    main: {
      title: project.name || "",
      description: project.note || "",
      link: project.repo || "",
      tags: (project.classifiedAs || []).map(tag => ({
        label: decodeURIComponent(tag),
        value: tag,
      })),
    },
  };

  console.log(defaultValues);

  const formMethods = useForm<EditMainValues>({
    mode: "all",
    resolver: yupResolver(mainStepSchema),
    defaultValues,
  });
  const { handleSubmit, formState, watch } = formMethods;
  const { isValid } = formState;

  const [loading, setLoading] = useState(false);

  async function onSubmit(values: EditMainValues) {
    setLoading(true);
    console.log(values);
    setLoading(false);
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <MainStep />
        <div className="flex justify-end">
          <Button primary submit disabled={!isValid}>
            {t("Update")}
          </Button>
        </div>
        <SearchTags></SearchTags>
        <pre>{JSON.stringify(watch(), null, 2)}</pre>
      </form>

      {loading && <LoadingOverlay />}
    </FormProvider>
  );
}
