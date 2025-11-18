import { Stack } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import { FieldWithUnit } from "../components/FieldWithUnit";

export const EnvironmentalSection = () => {
  const { t } = useTranslation("createProjectProps");

  return (
    <Stack vertical spacing="loose">
      <FieldWithUnit
        label={t("Water Consumption per Unit")}
        valueName="dpp.environmentalImpact.waterConsumption"
        unitName="dpp.environmentalImpact.waterConsumptionUnit"
        defaultUnit="L"
      />

      <FieldWithUnit
        label={t("Chemical Consumption per Unit")}
        valueName="dpp.environmentalImpact.chemicalConsumption"
        unitName="dpp.environmentalImpact.chemicalConsumptionUnit"
        defaultUnit="kg"
      />

      <FieldWithUnit
        label={t("CO₂e Emissions per Unit")}
        valueName="dpp.environmentalImpact.co2Emissions"
        unitName="dpp.environmentalImpact.co2EmissionsUnit"
        defaultUnit="kg"
      />

      <FieldWithUnit
        label={t("Energy Consumption per Unit")}
        valueName="dpp.environmentalImpact.energyConsumption"
        unitName="dpp.environmentalImpact.energyConsumptionUnit"
        defaultUnit="kWh"
      />
    </Stack>
  );
};
