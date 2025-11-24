import { Stack } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import { FileUploadField } from "../components/FileUploadField";

export const RecyclabilitySection = () => {
  const { t } = useTranslation("createProjectProps");

  return (
    <Stack vertical spacing="loose">
      <FileUploadField
        maxFiles={1}
        maxSize={10000000}
        label={t("Recycling Instructions")}
        name="dpp.recyclability.recyclingInstructions.value"
      />

      <FileUploadField
        maxFiles={1}
        maxSize={10000000}
        label={t("Material Composition")}
        name="dpp.recyclability.materialComposition.value"
      />

      <FileUploadField
        maxFiles={1}
        maxSize={10000000}
        label={t("Substances of Concern and their Concentration and Location")}
        name="dpp.recyclability.substancesOfConcern.value"
      />
    </Stack>
  );
};
