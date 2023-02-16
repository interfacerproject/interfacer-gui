import { Button, Stack, TextField } from "@bbtgnn/polaris-interfacer";
import { yupResolver } from "@hookform/resolvers/yup";
import PButtonRadio from "components/polaris/PButtonRadio";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import {
  autoimportDefaultValues,
  AutoimportInput,
  autoimportInputSchema,
  AutoimportSource,
  githubAutoimportInputSchema,
  gitlabAutoimportInputSchema,
} from "hooks/useAutoimportDefs";
import { isRequired } from "lib/isFieldRequired";
import { useTranslation } from "next-i18next";
import { Controller, useForm } from "react-hook-form";

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

  /* Setting data in the "main" form */

  function handleImport() {
    const inputValues = watch();
    // e poi settare i valori nel form principale in questo modo:
    // setValue("main", data.main);
    // setValue("images", data.images);
    // ...
  }

  const autoimportOptions = [
    { label: "GitHub", value: AutoimportSource.GITHUB },
    { label: "GitLab", value: AutoimportSource.GITLAB },
  ];

  function handleSourceChange(value: string) {
    setValue("source", value as AutoimportSource);
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
              placeholder={"github.com/username/repo"}
              autoComplete="off"
              onBlur={onBlur}
              onChange={onChange}
              value={value}
              error={errors.github?.url?.message}
              requiredIndicator={isRequired(githubAutoimportInputSchema, "url")}
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
                placeholder={"gitlab.com"}
                autoComplete="off"
                onBlur={onBlur}
                onChange={onChange}
                value={value}
                error={errors.gitlab?.host?.message}
                requiredIndicator={isRequired(gitlabAutoimportInputSchema, "host")}
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
                requiredIndicator={isRequired(gitlabAutoimportInputSchema, name.split(".")[1])}
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
    </Stack>
  );
}
