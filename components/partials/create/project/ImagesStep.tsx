import { useTranslation } from "next-i18next";
import * as yup from "yup";

// Components
import { Stack } from "@bbtgnn/polaris-interfacer";
import PFileUpload from "components/polaris/PFileUpload";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";

//

export type ImagesStepValues = Array<File>;
export const imagesStepSchema = yup.array();
export const imagesStepDefaultValues: ImagesStepValues = [];

//

export default function ImagesStep() {
  const { t } = useTranslation();

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle
        title={t("Upload pictures")}
        subtitle={t("Upload pictures to be displayed inside the project page")}
      />
      <PFileUpload
        maxFiles={10}
        accept="image"
        maxSize={2000000}
        helpText={t("Max 10 images | Max file size 2MB | Accepted formats: JPG, PNG, GIF, SVG")}
      />
    </Stack>
  );
}
