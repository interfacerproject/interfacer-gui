import DppReader from "components/DppReader";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { useTranslation } from "next-i18next";

const Scan = () => {
  const { t } = useTranslation("common");
  return (
    <div className="container mx-auto pt-10">
      <PTitleSubtitle
        title={t("Scan your QR code")}
        subtitle={t(
          "Discover contributors, related projects, Digital Product Passport of your resource using your phone"
        )}
      />
      <DppReader />
    </div>
  );
};

export default Scan;
