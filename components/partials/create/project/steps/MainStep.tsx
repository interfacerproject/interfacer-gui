import { Stack, TextField } from "@bbtgnn/polaris-interfacer";
import SelectTags from "components/SelectTags";
import BrMdEditor from "components/brickroom/BrMdEditor";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { formSetValueOptions } from "lib/formSetValueOptions";
import getIdFromFormName from "lib/getIdFromFormName";
import { isRequired } from "lib/isFieldRequired";
import { url } from "lib/regex";
import { useTranslation } from "next-i18next";
import { Controller, useFormContext } from "react-hook-form";
import * as yup from "yup";
import { CreateProjectValues } from "../CreateProjectForm";
import useYupLocaleObject from "hooks/useYupLocaleObject";

//

export interface MainStepValues {
  title: string;
  description: string;
  link: string;
  tags: Array<string>;
}

export const mainStepDefaultValues: MainStepValues = {
  title: "",
  description: "",
  link: "",
  tags: [],
};

export const mainStepSchema = () =>
  yup.object({
    title: yup.string().required(),
    link: yup.string().url().required(),
    tags: yup.array().of(yup.string()),
    description: yup
      .string()
      .test(
        "size-check",
        "Description length must be less than 2048 characters. If it's longer, please use the 'external link' field to reference it.",
        value => {
          if (value) return new Blob([value]).size < 2048;
          else return true;
        }
      ),
  });

//

export default function MainStep() {
  const { t } = useTranslation(["createProjectProps", "common"]);

  const { formState, control, setValue, watch, trigger } = useFormContext<CreateProjectValues>();
  const { errors } = formState;

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle
        title={t("Project Information")}
        subtitle={t(
          "This information will be used to identify your project and provide context to users who may be interested in it."
        )}
      />

      <Controller
        control={control}
        name="main.title"
        render={({ field: { onChange, onBlur, name, value } }) => (
          <TextField
            type="text"
            id={getIdFromFormName(name)}
            name={name}
            value={value}
            autoComplete="off"
            onChange={onChange}
            focused={true}
            onBlur={onBlur}
            label={t("Project title")}
            helpText={t("A clear and concise name for your project that summarizes its purpose or main focus.")}
            error={errors.main?.title?.message}
            requiredIndicator={isRequired(mainStepSchema(), "title")}
          />
        )}
      />

      <Controller
        control={control}
        name="main.link"
        render={({ field: { onChange, onBlur, name, value } }) => (
          <TextField
            type="text"
            id={getIdFromFormName(name)}
            name={name}
            value={value}
            autoComplete="off"
            onChange={onChange}
            onBlur={onBlur}
            placeholder={"projectsite.com/info"}
            label={t("External link")}
            error={errors.main?.link?.message}
            requiredIndicator={isRequired(mainStepSchema(), "link")}
          />
        )}
      />

      <BrMdEditor
        id="main-description"
        name="description"
        editorClass="h-60"
        value={watch("main.description")}
        label={t("Project Description")}
        subtitle={t("Give a better understanding of what your project is about and why it’s important.")}
        onChange={({ text, html }) => {
          setValue("main.description", text, formSetValueOptions);
        }}
        requiredIndicator={isRequired(mainStepSchema(), "description")}
        error={errors.main?.description?.message}
      />

      <div id="main-tags">
        <SelectTags
          tags={watch("main.tags")}
          setTags={tags => {
            setValue("main.tags", tags, formSetValueOptions);
            trigger("main.tags");
          }}
          error={errors.main?.tags?.message}
          label={t("Tags")}
          helpText={t("Add relevant keywords that describe your project.")}
          requiredIndicator={isRequired(mainStepSchema(), "tags")}
        />
      </div>
    </Stack>
  );
}
