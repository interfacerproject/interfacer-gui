import { Stack } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import { ControlledTextField } from "../components/ControlledTextField";

export const RecyclingInformationSection = () => {
  const { t } = useTranslation("createProjectProps");

  return (
    <Stack vertical spacing="loose">
      <ControlledTextField
        name="dpp.recyclingInformation.performedAction"
        label={t("Performed Action")}
        placeholder="Write your description here"
        multiline={4}
        helpText={t("Lorem ipsum dolor sit amet.")}
      />

      <ControlledTextField name="dpp.recyclingInformation.dateOfRecycling" label={t("Date and Time of Recycling")} />
    </Stack>
  );
};
