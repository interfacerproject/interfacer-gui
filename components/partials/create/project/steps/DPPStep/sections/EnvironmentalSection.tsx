import { Stack } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import { FieldWithUnit } from "../components/FieldWithUnit";

export const EnvironmentalSection = () => {
  const { t } = useTranslation("createProjectProps");

  return (
    <Stack vertical spacing="loose">
      <FieldWithUnit
        label={t("Water Consumption per Unit")}
        valueName="dpp.environmentalImpact.waterConsumptionPerUnit.value"
        unitName="dpp.environmentalImpact.waterConsumptionPerUnit.units"
        defaultUnit="L"
      />

      <FieldWithUnit
        label={t("Chemical Consumption per Unit")}
        valueName="dpp.environmentalImpact.chemicalConsumptionPerUnit.value"
        unitName="dpp.environmentalImpact.chemicalConsumptionPerUnit.units"
        defaultUnit="kg"
      />

      <FieldWithUnit
        label={t("CO₂e Emissions per Unit")}
        valueName="dpp.environmentalImpact.co2eEmissionsPerUnit.value"
        unitName="dpp.environmentalImpact.co2eEmissionsPerUnit.units"
        defaultUnit="kg"
      />

      <FieldWithUnit
        label={t("Energy Consumption per Unit")}
        valueName="dpp.environmentalImpact.energyConsumptionPerUnit.value"
        unitName="dpp.environmentalImpact.energyConsumptionPerUnit.units"
        defaultUnit="kWh"
      />
    </Stack>
  );
};
