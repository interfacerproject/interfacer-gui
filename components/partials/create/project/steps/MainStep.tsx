import { Stack, TextField } from "@bbtgnn/polaris-interfacer";
import BrMdEditor from "components/brickroom/BrMdEditor";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import SelectTags from "components/SelectTags";
import { SelectOption } from "components/types";
import { isRequired } from "lib/isFieldRequired";
import { url } from "lib/regex";
import { useTranslation } from "next-i18next";
import { Controller, useFormContext } from "react-hook-form";
import * as yup from "yup";
import { CreateProjectValues } from "../CreateProjectForm";

//

export interface MainStepValues {
  title: string;
  description: string;
  link: string;
  tags: Array<SelectOption>;
}

export const mainStepDefaultValues: MainStepValues = {
  title: "",
  description: "",
  link: "",
  tags: [],
};

export const mainStepSchema = yup.object({
  title: yup.string().required(),
  link: yup.string().matches(url, "Invalid URL").required(),
  tags: yup.array(),
  description: yup.string(),
});

//

export default function MainStep() {
  const { t } = useTranslation("createProjectProps");

  const { formState, control, setValue } = useFormContext<CreateProjectValues>();
  const { errors } = formState;

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle title={t("General information")} />

      <Controller
        control={control}
        name="main.title"
        render={({ field: { onChange, onBlur, name, value } }) => (
          <TextField
            type="text"
            id={name}
            name={name}
            value={value}
            autoComplete="off"
            onChange={onChange}
            onBlur={onBlur}
            placeholder={t("My new project")}
            label={t("Title")}
            error={errors.main?.title?.message}
            requiredIndicator={isRequired(mainStepSchema, "title")}
          />
        )}
      />

      <Controller
        control={control}
        name="main.link"
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
            error={errors.main?.link?.message}
            requiredIndicator={isRequired(mainStepSchema, "link")}
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
          setValue("main.description", text);
        }}
        requiredIndicator={isRequired(mainStepSchema, "description")}
        error={errors.main?.description?.message}
      />

      <Controller
        control={control}
        name="main.tags"
        render={({ field: { onChange, onBlur, name, ref } }) => (
          <SelectTags
            name={name}
            id={name}
            ref={ref}
            onBlur={onBlur}
            onChange={onChange}
            label={t("Tags")}
            isMulti
            placeholder={t("Open-source, 3D Printing, Medical use")}
            helpText={t("Select a tag from the list, or type to create a new one")}
            creatable={true}
            error={errors.main?.tags?.message}
            requiredIndicator={isRequired(mainStepSchema, "tags")}
          />
        )}
      />
    </Stack>
  );
}
