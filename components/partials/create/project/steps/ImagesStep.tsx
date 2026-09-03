import { useTranslation } from "next-i18next";

// Components
import { Stack } from "@bbtgnn/polaris-interfacer";
import PError from "components/polaris/PError";
import PFileUpload from "components/polaris/PFileUpload";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { ProjectType } from "components/types";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { useFormContext } from "react-hook-form";
import { CreateProjectValues, useProjectType } from "../CreateProjectForm";

export { type ImagesStepValues, imagesStepSchema, imagesStepDefaultValues } from "./ImagesStep.schema";

//

export default function ImagesStep() {
  const { t } = useTranslation("createProjectProps");
  const projectType = useProjectType();
  const isMachine = projectType === ProjectType.MACHINE;

  const { setValue, watch, formState } = useFormContext<CreateProjectValues>();
  const { errors } = formState;
  const images = watch().images;
  const imagesError = errors.images?.message;

  function handleUpdate(images: Array<File>) {
    setValue("images", images, formSetValueOptions);
  }

  const MAX_FILES = 10;

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle
        title={t("Upload pictures")}
        subtitle={
          isMachine
            ? t("Adding pictures of your machine helps others understand its capabilities and condition.")
            : t(
                "Adding pictures to your open source hardware project is an important way to showcase your work and help others understand your design."
              )
        }
      />
      <div>
        <PFileUpload
          maxFiles={MAX_FILES}
          files={images}
          onUpdate={handleUpdate}
          accept="image"
          maxSize={2000000}
          label={t("Upload up to {{MAX_FILES}} pictures", { MAX_FILES })}
          helpText={`${t("Max file size")}: 2MB | ${t("Accepted formats")}: JPG, PNG, GIF, SVG`}
          requiredIndicator={true}
        />
        {imagesError && <PError error={imagesError} />}
      </div>
    </Stack>
  );
}
