import { useTranslation } from "next-i18next";
import * as yup from "yup";

// Components
import { Stack } from "@bbtgnn/polaris-interfacer";
import PError from "components/polaris/PError";
import PFileUpload from "components/polaris/PFileUpload";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { useFormContext } from "react-hook-form";
import { CreateProjectValues } from "../CreateProjectForm";

//

export type ImagesStepValues = Array<File>;
export const imagesStepSchema = yup.array().min(1).required();
export const imagesStepDefaultValues: ImagesStepValues = [];

//

export default function ImagesStep() {
  const { t } = useTranslation("createProjectProps");

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
        subtitle={t(
          "Adding pictures to your open source hardware project is an important way to showcase your work and help others understand your design."
        )}
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
