import { Stack } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import { ControlledTextField } from "../components/ControlledTextField";

export const RefurbishmentInformationSection = () => {
  const { t } = useTranslation("createProjectProps");

  return (
    <Stack vertical spacing="loose">
      <ControlledTextField
        name="dpp.refurbishmentInformation.performedAction"
        label={t("Performed Action")}
        placeholder="Write your description here"
        multiline={4}
        helpText={t("Lorem ipsum dolor sit amet.")}
      />

      <ControlledTextField
        name="dpp.refurbishmentInformation.materialsUsed"
        label={t("Materials Used")}
        placeholder="Write your description here"
        multiline={4}
        helpText={t("Lorem ipsum dolor sit amet.")}
      />

      <ControlledTextField
        name="dpp.refurbishmentInformation.dateOfRefurbishment"
        label={t("Date and Time of Refurbishment")}
      />
    </Stack>
  );
};
