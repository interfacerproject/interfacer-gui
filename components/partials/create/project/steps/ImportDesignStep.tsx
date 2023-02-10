import { Button, Stack, TextField } from "@bbtgnn/polaris-interfacer";
import { yupResolver } from "@hookform/resolvers/yup";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { url } from "lib/regex";
import { useTranslation } from "next-i18next";
import { Controller, useForm, useFormContext } from "react-hook-form";
import * as yup from "yup";
import { CreateProjectValues } from "../CreateProjectForm";

//

export interface FormValues {
  repoUrl: string;
}

//

export default function ImportDesign() {
  const { t } = useTranslation();

  /* Form handling */

  const defaultValues: FormValues = {
    repoUrl: "",
  };

  const schema = yup.object().shape({
    repoUrl: yup
      .string()
      .matches(url, t("Invalid URL"))
      .matches(/github.com/, t("Url does not match a GitHub repo"))
      .required(),
  });

  const form = useForm<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { formState, control } = form;
  const { isValid } = formState;

  /* Setting data in the "main" form */

  const { setValue, getValues, watch } = useFormContext<CreateProjectValues>();

  function handleImport() {
    // Qui bisogna prima fare il fetch dei dati, secondo l'interfaccia CreateProjectValues
    // const data = import(getValues("repoUrl"))
    // e poi settare i valori nel form principale in questo modo:
    // setValue("main", data.main);
    // setValue("images", data.images);
    // ...
  }

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle
        title={t("Import from external source")}
        subtitle={t("Import a project from Github, Thingiverse, LOSH or Git")}
      />

      <Controller
        control={control}
        name="repoUrl"
        render={({ field: { onChange, onBlur, name, value } }) => (
          <TextField
            type="url"
            label={t("Repo URL")}
            placeholder={"github.com/username/repo"}
            autoComplete="off"
            helpText={t("Note: Currently only GitHub is supported")}
            onBlur={onBlur}
            onChange={onChange}
            value={value}
          />
        )}
      />

      {isValid && (
        <Button primary fullWidth onClick={handleImport}>
          {t("Import repo")}
        </Button>
      )}
    </Stack>
  );
}
