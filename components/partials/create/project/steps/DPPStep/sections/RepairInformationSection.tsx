import { Stack } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import { ControlledTextField } from "../components/ControlledTextField";

export const RepairInformationSection = () => {
  const { t } = useTranslation("createProjectProps");

  return (
    <Stack vertical spacing="loose">
      <ControlledTextField
        name="dpp.repairInformation.reasonForRepair"
        label={t("Reason for Repair")}
        placeholder="Write your description here"
        multiline={4}
        helpText={t("Lorem ipsum dolor sit amet.")}
      />

      <ControlledTextField
        name="dpp.repairInformation.performedAction"
        label={t("Performed Action")}
        placeholder="Write your description here"
        multiline={4}
        helpText={t("Lorem ipsum dolor sit amet.")}
      />

      <ControlledTextField
        name="dpp.repairInformation.materialsUsed"
        label={t("Materials Used")}
        placeholder="Write your description here"
        multiline={4}
        helpText={t("Lorem ipsum dolor sit amet.")}
      />

      <ControlledTextField name="dpp.repairInformation.dateOfRepair" label={t("Date of Repair")} />
    </Stack>
  );
};
