import { Button, Stack, TextField } from "@bbtgnn/polaris-interfacer";
import { yupResolver } from "@hookform/resolvers/yup";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { url } from "lib/regex";
import { useTranslation } from "next-i18next";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

//

export interface ImportedData {
  title: string;
  description: string;
  licenses: string[];
}

export type ImportDesignStepData = ImportedData | null;

export interface Props {
  onImport?: (data: ImportDesignStepData) => void;
}

export interface FormValues {
  repoUrl: string;
}

//

export default function ImportDesign(props: Props) {
  const { t } = useTranslation();
  const { onImport = () => {} } = props;

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

  const { formState, control, watch } = form;
  const { isValid } = formState;

  function importData(url: string): ImportDesignStepData {
    return null;
  }

  function handleImport() {
    // TODO: display full-screen loading
    const data = importData(watch("repoUrl"));
    onImport(data);
    // TOO: hide loading
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
