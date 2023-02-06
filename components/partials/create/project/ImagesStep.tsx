import { useTranslation } from "next-i18next";

// Components
import { Stack } from "@bbtgnn/polaris-interfacer";
import PFileUpload from "components/polaris/PFileUpload";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";

//

export type Values = Array<File>;

export interface Props {
  onUpdate?: (images: Values) => void;
}

export default function ImagesStep(props: Props) {
  const { onUpdate = () => {} } = props;
  const { t } = useTranslation();

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle
        title={t("Upload pictures")}
        subtitle={t("Upload pictures to be displayed inside the project page")}
      />
      <PFileUpload
        maxFiles={10}
        onUpdate={onUpdate}
        accept="image"
        maxSize={2000000}
        helpText={t("Max 10 images | Max file size 2MB | Accepted formats: JPG, PNG, GIF, SVG")}
      />
    </Stack>
  );
}
