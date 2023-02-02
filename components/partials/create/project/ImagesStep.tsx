import PFileUpload from "components/polaris/PFileUpload";
import { useTranslation } from "next-i18next";

export default function ImagesStep() {
  const { t } = useTranslation();

  return <PFileUpload></PFileUpload>;
}
