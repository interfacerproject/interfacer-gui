import { Text } from "@bbtgnn/polaris-interfacer";
import dayjs from "lib/dayjs";
import { useTranslation } from "next-i18next";

const LoshImportedDate = (p: { addedOn?: string }) => {
  const { addedOn } = p;
  const { t } = useTranslation("common");
  if (!addedOn) return null;
  return (
    <Text variant="bodyMd" as="h3">
      {t("Added on ") + dayjs(addedOn).format("YY-MM-DD")}
    </Text>
  );
};

export default LoshImportedDate;
