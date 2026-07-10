import { Stack, TextField } from "@bbtgnn/polaris-interfacer";
import BrMdEditor from "components/brickroom/BrMdEditor";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { ProjectType } from "components/types";
import { formSetValueOptions } from "lib/formSetValueOptions";
import getIdFromFormName from "lib/getIdFromFormName";
import { isRequired } from "lib/isFieldRequired";
import { useTranslation } from "next-i18next";
import { Controller, useFormContext } from "react-hook-form";
import { CreateProjectValues, useProjectType } from "../CreateProjectForm";

import { type MainStepValues, mainStepDefaultValues, mainStepSchema } from "./MainStep.schema";
export { type MainStepValues, mainStepDefaultValues, mainStepSchema };

//

export default function MainStep() {
  const { t } = useTranslation(["createProjectProps", "common"]);
  const projectType = useProjectType();

  const { formState, control, setValue, watch } = useFormContext<CreateProjectValues>();
  const { errors } = formState;

  const isMachine = projectType === ProjectType.MACHINE;
  const entityLabel = isMachine ? t("Machine") : t("Project");
  const entityLabelLower = isMachine ? t("machine") : t("project");

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle
        title={isMachine ? t("Machine Information") : t("Project Information")}
        subtitle={
          isMachine
            ? t(
                "This information will be used to identify your machine and provide context to users who may be interested in it."
              )
            : t(
                "This information will be used to identify your project and provide context to users who may be interested in it."
              )
        }
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
            label={isMachine ? t("Machine name") : t("Project title")}
            helpText={
              isMachine
                ? t("A clear and concise name for your machine that summarizes its purpose or main focus.")
                : t("A clear and concise name for your project that summarizes its purpose or main focus.")
            }
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
            label={isMachine ? t("Machine data") : t("Project data")}
            helpText={
              isMachine
                ? t(
                    "Add here a link to the repository or page where the machine's files or description are contained. The link will be visible in the machine page."
                  )
                : t(
                    "Add here a link to the repository or page where the projects files or description are contained. The link will be visible in the project page."
                  )
            }
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
        label={isMachine ? t("Machine Description") : t("Project Description")}
        subtitle={
          isMachine
            ? t("Give a better understanding of what your machine is about and why it's important.")
            : t("Give a better understanding of what your project is about and why it's important.")
        }
        onChange={({ text, html }) => {
          setValue("main.description", text, formSetValueOptions);
        }}
        requiredIndicator={isRequired(mainStepSchema(), "description")}
        error={errors.main?.description?.message}
      />
    </Stack>
  );
}
