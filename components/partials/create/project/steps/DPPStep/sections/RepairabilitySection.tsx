import { Stack } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import { FileUploadField } from "../components/FileUploadField";
import { YesNoRadioField } from "../components/YesNoRadioField";

export const RepairabilitySection = () => {
  const { t } = useTranslation("createProjectProps");

  return (
    <Stack vertical spacing="loose">
      <FileUploadField
        label={t("Service and Repair Instructions")}
        name="dpp.reparability.serviceAndRepairInstructions.value"
        fileName="Service Instructions.PDF"
      />

      <YesNoRadioField
        label={t("Availability of Spare Parts")}
        name="dpp.reparability.availabilityOfSpareParts.value"
        id="spareParts"
      />
    </Stack>
  );
};
