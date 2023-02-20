import { Button, Stack, TextField } from "@bbtgnn/polaris-interfacer";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingOverlay from "components/LoadingOverlay";
import PButtonRadio from "components/polaris/PButtonRadio";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import useAutoimport from "hooks/useAutoimport";
import {
  autoimportDefaultValues,
  AutoimportInput,
  autoimportInputSchema,
  AutoimportSource,
} from "hooks/useAutoimportDefs";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { Controller, useForm, useFormContext } from "react-hook-form";
import { CreateProjectValues } from "../CreateProjectForm";

//

export default function ImportDesign() {
  const { t } = useTranslation();

  /* Form handling */

  const form = useForm<AutoimportInput>({
    mode: "all",
    resolver: yupResolver(autoimportInputSchema),
    defaultValues: autoimportDefaultValues,
  });

  const { formState, control, watch, setValue } = form;
  const { isValid, errors } = formState;

  const autoimportOptions = [
    { label: "GitHub", value: AutoimportSource.GITHUB },
    { label: "GitLab", value: AutoimportSource.GITLAB },
  ];

  function handleSourceChange(value: string) {
    setValue("source", value as AutoimportSource, { shouldValidate: true });
  }

  /* Setting data in the "main" form */

  const { setValue: setProjectValues } = useFormContext<CreateProjectValues>();

  const [loading, setLoading] = useState(false);
  const { importRepository } = useAutoimport();

  async function handleImport() {
    setLoading(true);
    const inputValues = watch();
    const result = await importRepository(inputValues);
    if (result) setFormValues(result);
    setLoading(false);
  }

  function setFormValues(values: Partial<CreateProjectValues>) {
    for (const [key, value] of Object.entries(values)) {
      setProjectValues(key as keyof CreateProjectValues, value, { shouldValidate: true });
    }
  }

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle
        title={t("Import from external source")}
        subtitle={t("Import a project from Github, Thingiverse, LOSH or Git")}
      />

      <PButtonRadio options={autoimportOptions} onChange={handleSourceChange} selected={watch("source")} />

      {watch("source") === AutoimportSource.GITHUB && (
        <Controller
          control={control}
          name="github.url"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              type="url"
              label={t("Repo URL")}
              placeholder={"https://github.com/username/repo"}
              helpText={t("Please include the protocol (https://...) in the URL")}
              autoComplete="off"
              onBlur={onBlur}
              onChange={onChange}
              value={value}
              error={errors.github?.url?.message}
            />
          )}
        />
      )}

      {watch("source") === AutoimportSource.GITLAB && (
        <Stack vertical spacing="baseTight">
          <Controller
            control={control}
            name="gitlab.host"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                type="url"
                label={t("Gitlab host")}
                placeholder={"https://gitlab.com"}
                helpText={t("Please include the protocol (https://...) in the URL")}
                autoComplete="off"
                onBlur={onBlur}
                onChange={onChange}
                value={value}
                error={errors.gitlab?.host?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="gitlab.projectId"
            render={({ field: { onChange, onBlur, value, name } }) => (
              <TextField
                type="url"
                label={t("Repo ID")}
                placeholder={"12345678"}
                autoComplete="off"
                onBlur={onBlur}
                onChange={onChange}
                value={value}
                error={errors.gitlab?.projectId?.message}
              />
            )}
          />
        </Stack>
      )}

      {isValid && (
        <Button primary fullWidth onClick={handleImport}>
          {t("Import repo")}
        </Button>
      )}

      {loading && <LoadingOverlay />}
    </Stack>
  );
}
