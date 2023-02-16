import { Button } from "@bbtgnn/polaris-interfacer";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingOverlay from "components/LoadingOverlay";
import MainStep, {
  mainStepDefaultValues,
  mainStepSchema,
  MainStepValues,
} from "components/partials/create/project/steps/MainStep";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

//

export default function EditProject() {
  const { t } = useTranslation();

  const formMethods = useForm<MainStepValues>({
    mode: "all",
    resolver: yupResolver(mainStepSchema),
    defaultValues: mainStepDefaultValues,
  });
  const { handleSubmit } = formMethods;

  const [loading, setLoading] = useState(false);

  async function onSubmit(values: MainStepValues) {
    setLoading(true);
    console.log(values);
    setLoading(false);
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <MainStep />
        <Button primary submit>
          {t("Update")}
        </Button>
      </form>

      {loading && <LoadingOverlay />}
    </FormProvider>
  );
}
