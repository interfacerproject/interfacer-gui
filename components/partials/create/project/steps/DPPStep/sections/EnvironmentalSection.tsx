import { Stack } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import { FieldWithUnit } from "../components/FieldWithUnit";
import { RangeSliderField } from "../components/RangeSliderField";

export const EnvironmentalSection = () => {
  const { t } = useTranslation("createProjectProps");

  return (
    <Stack vertical spacing="loose">
      <RangeSliderField
        label={t("Energy Consumption (kWh)")}
        valueName="dpp.environmentalImpact.energyConsumptionPerUnit.value"
        unitName="dpp.environmentalImpact.energyConsumptionPerUnit.units"
        defaultUnit="kWh"
        min={0}
        max={1000}
        step={1}
      />

      <RangeSliderField
        label={t("CO₂ Emissions per Unit (kg)")}
        valueName="dpp.environmentalImpact.co2eEmissionsPerUnit.value"
        unitName="dpp.environmentalImpact.co2eEmissionsPerUnit.units"
        defaultUnit="kg"
        min={0}
        max={500}
        step={1}
      />

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
    </Stack>
  );
};
