import { Button, Stack, TextField } from "@bbtgnn/polaris-interfacer";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingOverlay from "components/LoadingOverlay";
import PButtonRadio from "components/polaris/PButtonRadio";
import PFieldInfo from "components/polaris/PFieldInfo";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import useAutoimport from "hooks/useAutoimport";
import {
  autoimportDefaultValues,
  AutoimportInput,
  autoimportInputSchema,
  AutoimportSource,
} from "hooks/useAutoimportDefs";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { Controller, useForm, useFormContext } from "react-hook-form";
import { CreateProjectValues } from "../CreateProjectForm";

//

export default function ImportDesign() {
  const { t } = useTranslation("createProjectProps");

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
    setValue("source", value as AutoimportSource, formSetValueOptions);
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
      setProjectValues(key as keyof CreateProjectValues, value, formSetValueOptions);
    }
  }

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle
        title={t("Import from Repository")}
        subtitle={
          <>
            {t(
              "Easily and quickly import your open source hardware designs and projects directly from an existing repo. You can then review and make any necessary changes before submitting your project."
            )}
            <br />
            <br />
            {t(
              "We recommend to read this guide to know how to structure your folders for better machine-readability:"
            )}{" "}
            <a
              className="text-text-primary hover:underline"
              href="https://gitlab.fabcity.hamburg/hardware/interfacer-osh-build-workshops/project-coordination/-/blob/main/OSH%20Dokumentation/10_Step__Documentation_Guideline.md"
              target="_blank"
              rel="noreferrer"
            >
              {t("How to start with your OSH Repository in 10 Steps")}
            </a>
          </>
        }
      />

      <PFieldInfo label={t("Select repo type")} helpText={t("We currently support only GitHub and GitLab")}>
        <PButtonRadio options={autoimportOptions} onChange={handleSourceChange} selected={watch("source")} />
      </PFieldInfo>

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
                label={t("GitLab host")}
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
