import { Stack } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import { FieldWithUnit } from "../components/FieldWithUnit";

export const EnvironmentalSection = () => {
  const { t } = useTranslation("createProjectProps");

  return (
    <Stack vertical spacing="loose">
      <FieldWithUnit
        label={t("Water Consumption per Unit")}
        valueName="dpp.environmental.waterConsumption"
        unitName="dpp.environmental.waterConsumptionUnit"
        defaultUnit="L"
      />

      <FieldWithUnit
        label={t("Chemical Consumption per Unit")}
        valueName="dpp.environmental.chemicalConsumption"
        unitName="dpp.environmental.chemicalConsumptionUnit"
        defaultUnit="kg"
      />

      <FieldWithUnit
        label={t("CO₂e Emissions per Unit")}
        valueName="dpp.environmental.co2Emissions"
        unitName="dpp.environmental.co2EmissionsUnit"
        defaultUnit="kg"
      />

      <FieldWithUnit
        label={t("Energy Consumption per Unit")}
        valueName="dpp.environmental.energyConsumption"
        unitName="dpp.environmental.energyConsumptionUnit"
        defaultUnit="kWh"
      />
    </Stack>
  );
};
