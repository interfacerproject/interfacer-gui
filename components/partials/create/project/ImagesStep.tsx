import { Stack } from "@bbtgnn/polaris-interfacer";
import PFileUpload from "components/polaris/PFileUpload";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { useTranslation } from "next-i18next";

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
        onUpdate={files => {
          console.log(files);
        }}
        accept="image"
        maxSize={2000000}
        helpText={t("Max 10 images | Max file size 2MB | Accepted formats: JPG, PNG, GIF, SVG")}
      />
    </Stack>
  );
}
