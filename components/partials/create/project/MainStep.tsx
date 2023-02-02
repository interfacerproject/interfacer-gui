import { Stack, TextField } from "@bbtgnn/polaris-interfacer";
import { yupResolver } from "@hookform/resolvers/yup";
import BrMdEditor from "components/brickroom/BrMdEditor";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import SelectTags from "components/SelectTags";
import { isRequired } from "lib/isFieldRequired";
import { useTranslation } from "next-i18next";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

export interface Values {
  title: string;
  description: string;
  link: string;
  tags: Array<string>;
}

export interface Props {
  projectType: "service" | "design" | "product";
  onValid?: (values: Values) => void;
}

export default function MainStep(props: Props) {
  const { projectType, onValid = () => {} } = props;
  const { t } = useTranslation();

  const defaultValues: Values = {
    title: "",
    description: "",
    link: "",
    tags: [],
  };

  const schema = yup.object({
    title: yup.string().required(),
    link: yup.string().required(),
    tags: yup.array(),
    description: yup.string(),
  });

  const form = useForm<Values>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { formState, control, setValue, watch } = form;
  const { isValid, errors } = formState;

  if (isValid) onValid(watch());

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle title={t("Create a new project")} subtitle={t("Make sure you read the Community Guidelines.")} />

      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, name, value } }) => (
          <TextField
            type="text"
            id={name}
            name={name}
            value={value}
            autoComplete="off"
            onChange={onChange}
            onBlur={onBlur}
            label={t("Title")}
            error={errors[name]?.message}
            requiredIndicator={isRequired(schema, name)}
          />
        )}
      />

      <Controller
        control={control}
        name="link"
        render={({ field: { onChange, onBlur, name, value } }) => (
          <TextField
            type="text"
            id={name}
            name={name}
            value={value}
            autoComplete="off"
            onChange={onChange}
            onBlur={onBlur}
            label={t("External link")}
            placeholder={t("projectsite.com/info")}
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
        helpText={`${t("In this markdown editor, the right box shows a preview")}. ${t("Type up to 2048 characters")}.`}
        subtitle={t("Short description to be displayed on the project page")}
        onChange={({ text, html }) => {
          setValue("description", text);
        }}
        requiredIndicator={isRequired(schema, "description")}
        error={errors.description?.message}
      />

      <Controller
        control={control}
        name="tags"
        render={({ field: { onChange, onBlur, name, ref } }) => (
          <SelectTags
            name={name}
            id={name}
            ref={ref}
            onBlur={onBlur}
            onChange={onChange}
            label={`${t("Tags")}:`}
            isMulti
            placeholder={t("Open-source, 3D Printing, Medical use")}
            helpText={t("Select a tag from the list, or type to create a new one")}
            error={errors[name]?.message}
            creatable={true}
            requiredIndicator={isRequired(schema, name)}
          />
        )}
      />
    </Stack>
  );
}
