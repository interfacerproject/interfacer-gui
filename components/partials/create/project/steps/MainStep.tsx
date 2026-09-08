import { RangeSlider, Stack, TextField } from "@bbtgnn/polaris-interfacer";
import { complexityLevelFromLabel, complexityLevelFromNumber } from "lib/tagging";
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

      {projectType === ProjectType.DESIGN && (
        <div className="flex flex-col gap-8">
          {(() => {
            const stored = watch("main.complexity");
            const current = complexityLevelFromLabel(stored) || complexityLevelFromNumber(3);
            const display = `${t(current.label)} (${current.level})`;
            return (
              <div className="flex flex-col gap-[5px]">
                <div
                  className="text-ifr-text-primary mb-[1px]"
                  style={{
                    fontFamily: "var(--ifr-font-body)",
                    fontSize: "var(--ifr-fs-base)",
                    fontWeight: "var(--ifr-fw-medium)",
                    lineHeight: "24px",
                  }}
                >
                  {t("Complexity of this project")} <span style={{ color: "var(--ifr-red)" }}>*</span>
                </div>
                <RangeSlider
                  id="main-complexity"
                  label={t("Complexity of this project")}
                  labelHidden
                  min={1}
                  max={5}
                  step={1}
                  value={current.level}
                  output={false}
                  onChange={v =>
                    setValue("main.complexity", complexityLevelFromNumber(Number(v)).label, formSetValueOptions)
                  }
                />
                <div
                  className="flex justify-between px-2"
                  style={{
                    fontFamily: "var(--ifr-font-body)",
                    fontSize: "var(--ifr-fs-base)",
                    fontWeight: "var(--ifr-fw-bold)",
                    lineHeight: "21px",
                  }}
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <span
                      key={n}
                      style={{ color: n === current.level ? "var(--ifr-text-primary)" : "var(--ifr-text-secondary)" }}
                    >
                      {n}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col items-start gap-[2px] pt-[6px]">
                  <p
                    className="m-0"
                    style={{
                      fontFamily: "var(--ifr-font-body)",
                      fontSize: "var(--ifr-fs-md)",
                      fontWeight: "var(--ifr-fw-medium)",
                      lineHeight: "24px",
                      color: "var(--ifr-green)",
                    }}
                  >
                    {display}
                  </p>
                  <p
                    className="text-ifr-text-secondary m-0"
                    style={{
                      fontFamily: "var(--ifr-font-body)",
                      fontSize: "var(--ifr-fs-base)",
                      fontWeight: "var(--ifr-fw-regular)",
                    }}
                  >
                    {current.description}
                  </p>
                </div>
              </div>
            );
          })()}

          <Controller
            control={control}
            name="main.bom"
            render={({ field: { onChange, onBlur, name, value } }) => (
              <TextField
                type="text"
                id={getIdFromFormName(name)}
                name={name}
                value={value || ""}
                autoComplete="off"
                onChange={onChange}
                onBlur={onBlur}
                placeholder={"https://github.com/you/project/blob/main/BOM.csv"}
                label={t("Bill of Materials (BOM)")}
                helpText={t("Add a link to your bill of materials. The link will be visible in the design page.")}
                error={errors.main?.bom?.message}
              />
            )}
          />
        </div>
      )}
    </Stack>
  );
}
