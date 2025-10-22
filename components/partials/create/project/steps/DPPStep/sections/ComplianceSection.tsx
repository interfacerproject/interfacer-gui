import { Stack } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import { YesNoRadioField } from "../components/YesNoRadioField";

export const ComplianceSection = () => {
  const { t } = useTranslation("createProjectProps");

  return (
    <Stack vertical spacing="loose">
      <YesNoRadioField label={t("CE Marking")} name="dpp.compliance.ceMarking" id="ceMarking" />

      <YesNoRadioField label={t("RoHS Compliance")} name="dpp.compliance.rohsCompliance" id="rohsCompliance" />
    </Stack>
  );
};
