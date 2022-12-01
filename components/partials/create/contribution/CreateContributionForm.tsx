import { useTranslation } from "next-i18next";

// Request

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import { Banner, Button, Card, Spinner, Stack, TextField } from "@bbtgnn/polaris-interfacer";
import BrMdEditor from "components/brickroom/BrMdEditor";
import { ChildrenProp as CP } from "components/brickroom/types";

// Types

// Other
import { isRequired } from "lib/isFieldRequired";
import { useRouter } from "next/router";
import React from "react";

//

export interface Props extends CP {
  onSubmit: (data: FormValues) => void;
  error?: string;
  setError?: React.Dispatch<React.SetStateAction<string>>;
}

export interface FormValues {
  parentRepositoryID: string;
  contributionRepositoryID: string; // also: url
  description: string;
  strengthPoints: string;
}

//

export default function NewAssetForm(props: Props) {
  const { onSubmit, error, setError } = props;
  const { t } = useTranslation("createProjectProps");

  const router = useRouter();
  const { repo } = router.query;

  //

  const defaultValues: FormValues = {
    parentRepositoryID: "",
    contributionRepositoryID: "",
    description: "",
    strengthPoints: "0",
  };

  const schema = yup
    .object({
      parentRepositoryID: yup.string().required(),
      contributionRepositoryID: yup.string().required(),
      description: yup.string().required(),
      strengthPoints: yup.number().positive().integer().required(),
    })
    .required();

  const form = useForm<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { formState, handleSubmit, register, control, setValue, watch } = form;
  const { isValid, errors, isSubmitting } = formState;

  setValue("parentRepositoryID", repo?.toString() || "");

  //

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack vertical spacing="extraLoose">
        <Controller
          control={control}
          name="parentRepositoryID"
          render={({ field: { onChange, onBlur, name, value } }) => (
            <TextField
              type="text"
              id={name}
              name={name}
              value={value}
              autoComplete="off"
              onChange={onChange}
              onBlur={onBlur}
              label={t("Parent repository ID")}
              placeholder={t("17272827282")}
              error={errors[name]?.message}
              requiredIndicator={isRequired(schema, name)}
            />
          )}
        />

        <Controller
          control={control}
          name="contributionRepositoryID"
          render={({ field: { onChange, onBlur, name, value } }) => (
            <TextField
              type="text"
              id={name}
              name={name}
              value={value}
              autoComplete="off"
              onChange={onChange}
              onBlur={onBlur}
              label={t("Contribution repository link or Interfacer ID")}
              placeholder={t("github[dot]com/my-repo")}
              helpText={t("Reference to the resource's repository or Interfacer ID of the resource")}
              error={errors[name]?.message}
              requiredIndicator={isRequired(schema, name)}
            />
          )}
        />

        <BrMdEditor
          id="description"
          name="description"
          editorClass="h-60"
          label={t("General information")}
          helpText={`${t("In this markdown editor, the right box shows a preview")}. ${t(
            "Type up to 2048 characters"
          )}.`}
          subtitle={t("Short description to be displayed on the asset page")}
          onChange={({ text, html }) => {
            setValue("description", text);
          }}
          requiredIndicator={isRequired(schema, "description")}
          error={errors.description?.message}
        />

        <Controller
          control={control}
          name="strengthPoints"
          render={({ field: { onChange, onBlur, name, value } }) => (
            <TextField
              type="number"
              id={name}
              name={name}
              value={value}
              autoComplete="off"
              onChange={onChange}
              onBlur={onBlur}
              label={t("Strenght pts that you expect from this contribution:")}
              helpText={t("Set up a reasonable value for this asset.")}
              error={errors[name]?.message}
              requiredIndicator={isRequired(schema, name)}
            />
          )}
        />

        {/* Slot to display errors, for example */}
        {error && setError && (
          <Banner
            title={t("Error in contribution creation")}
            status="critical"
            onDismiss={() => {
              setError("");
            }}
          >
            {error}
          </Banner>
        )}

        {isSubmitting && (
          <Card>
            <div className="flex flex-col items-center justify-center p-4">
              <Spinner />
              <p className="pt-2">{`${t("Creating contribution...")}`}</p>
            </div>
          </Card>
        )}

        <Button size="large" primary fullWidth submit disabled={!isValid || isSubmitting} id="submit">
          {t("Send contribution")}
        </Button>
      </Stack>
    </form>
  );
}
