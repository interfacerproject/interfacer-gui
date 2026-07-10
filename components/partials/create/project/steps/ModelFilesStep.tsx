import { Stack } from "@bbtgnn/polaris-interfacer";
import PError from "components/polaris/PError";
import PFileUpload from "components/polaris/PFileUpload";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { useTranslation } from "next-i18next";
import { useFormContext } from "react-hook-form";
import { CreateProjectValues } from "../CreateProjectForm";

export { type ModelFilesStepValues, modelFilesStepSchema, modelFilesStepDefaultValues } from "./ModelFilesStep.schema";

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
        title={t("Upload 3D and CAD files")}
        subtitle={t(
          "Attach fabrication-ready 3D files and CAD models for this design. You can upload many files — they will be viewable and downloadable from the design detail page."
        )}
      />
      <div>
        <PFileUpload
          files={modelFiles}
          onUpdate={handleUpdate}
          accept="file"
          maxSize={maxFileSize}
          label={t("Upload STEP, STP or STL files")}
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
