import { Stack } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import { FileUploadField } from "../components/FileUploadField";

export const RecyclabilitySection = () => {
  const { t } = useTranslation("createProjectProps");

  return (
    <Stack vertical spacing="loose">
      <FileUploadField
        label={t("Recycling Instructions")}
        name="dpp.recyclability.recyclingInstructions"
        fileName="Recycling Instructions.PDF"
      />

      <FileUploadField
        label={t("Material Composition")}
        name="dpp.recyclability.materialComposition"
        fileName="Material Composition.PDF"
      />

      <FileUploadField
        label={t("Substances of Concern and their Concentration and Location")}
        name="dpp.recyclability.substancesOfConcern"
        fileName="Substances of Concern.PDF"
      />
    </Stack>
  );
};
