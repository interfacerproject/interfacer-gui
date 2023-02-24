import { useTranslation } from "next-i18next";
import * as yup from "yup";

// Components
import { Stack } from "@bbtgnn/polaris-interfacer";
import PFileUpload from "components/polaris/PFileUpload";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { useFormContext } from "react-hook-form";
import { CreateProjectValues } from "../CreateProjectForm";

//

export type ImagesStepValues = Array<File>;
export const imagesStepSchema = yup.array();
export const imagesStepDefaultValues: ImagesStepValues = [];

//

export default function ImagesStep() {
  const { t } = useTranslation();

  const { setValue, watch } = useFormContext<CreateProjectValues>();
  const images = watch("images");

  function handleUpdate(images: Array<File>) {
    setValue("images", images, formSetValueOptions);
  }

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle
        title={t("Upload pictures")}
        subtitle={t("Upload pictures to be displayed inside the project page")}
      />
      <PFileUpload
        maxFiles={10}
        files={images}
        onUpdate={handleUpdate}
        accept="image"
        maxSize={2000000}
        helpText={t("Max 10 images | Max file size 2MB | Accepted formats: JPG, PNG, GIF, SVG")}
      />
    </Stack>
  );
}
