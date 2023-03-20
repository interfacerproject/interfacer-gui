import FullWidthBanner from "components/FullWidthBanner";
import { Text } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const CreatedBanner = () => {
  const { t } = useTranslation("common");
  const router = useRouter();

  const isCreated = router.query.created === "true";

  const [viewCreatedBanner, setViewCreatedBanner] = useState(false);

  useEffect(() => {
    setViewCreatedBanner(isCreated);
  }, [isCreated]);

  const closeBanner = () => {
    setViewCreatedBanner(false);
  };
  return (
    <FullWidthBanner open={viewCreatedBanner} onClose={closeBanner}>
      <Text as="p" variant="bodyMd" id="created-banner-content">
        {t("Project succesfully created!")}
      </Text>
    </FullWidthBanner>
  );
};

export default CreatedBanner;
