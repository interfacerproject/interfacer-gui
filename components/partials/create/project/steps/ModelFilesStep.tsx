import { Stack } from "@bbtgnn/polaris-interfacer";
import PError from "components/polaris/PError";
import PFileUpload from "components/polaris/PFileUpload";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { useTranslation } from "next-i18next";
import { useFormContext } from "react-hook-form";
import * as yup from "yup";
import { CreateProjectValues } from "../CreateProjectForm";

export type ModelFilesStepValues = Array<File>;
export const modelFilesStepSchema = () => yup.array().default([]);
export const modelFilesStepDefaultValues: ModelFilesStepValues = [];

const allowedExtensions = new Set(["step", "stp", "stl"]);
const maxFileSize = 50000000;

function getExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

export default function ModelFilesStep() {
  const { t } = useTranslation("createProjectProps");
  const { setValue, watch, formState } = useFormContext<CreateProjectValues>();
  const { errors } = formState;
  const modelFiles = watch().modelFiles;
  const modelFilesError = errors.modelFiles?.message;

  function handleUpdate(files: Array<File>) {
    setValue("modelFiles", files, formSetValueOptions);
  }

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle
        title={t("Upload 3D model files")}
        subtitle={t(
          "Attach fabrication-ready 3D files for this design so people can inspect the model directly in the detail page."
        )}
      />
      <div>
        <PFileUpload
          maxFiles={4}
          files={modelFiles}
          onUpdate={handleUpdate}
          accept="file"
          maxSize={maxFileSize}
          label={t("Upload STEP or STL files")}
          helpText={`${t("Max file size")}: 50MB | ${t("Accepted formats")}: STEP, STP, STL`}
          customValidators={[
            file => ({
              valid: allowedExtensions.has(getExtension(file.name)),
              message: t("Only STEP, STP, and STL files are supported"),
            }),
          ]}
        />
        {modelFilesError && <PError error={String(modelFilesError)} />}
      </div>
    </Stack>
  );
}
