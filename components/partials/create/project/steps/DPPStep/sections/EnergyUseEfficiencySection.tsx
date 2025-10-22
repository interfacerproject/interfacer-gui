import { Stack } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import { ControlledTextField } from "../components/ControlledTextField";
import { FieldWithUnit } from "../components/FieldWithUnit";

export const EnergyUseEfficiencySection = () => {
  const { t } = useTranslation("createProjectProps");

  return (
    <Stack vertical spacing="loose">
      <ControlledTextField name="dpp.energyUseEfficiency.batteryType" label={t("Battery Type")} />

      <FieldWithUnit
        label={t("Battery Charging Time")}
        valueName="dpp.energyUseEfficiency.batteryChargingTime"
        unitName="dpp.energyUseEfficiency.batteryChargingTimeUnit"
        placeholder="e.g., 10000 min"
        defaultUnit="min"
      />

      <FieldWithUnit
        label={t("Battery Life")}
        valueName="dpp.energyUseEfficiency.batteryLife"
        unitName="dpp.energyUseEfficiency.batteryLifeUnit"
        placeholder="e.g., 10000 min"
        defaultUnit="min"
      />

      <ControlledTextField name="dpp.energyUseEfficiency.chargerType" label={t("Charger Type")} />

      <FieldWithUnit
        label={t("Maximum Electrical Power")}
        valueName="dpp.energyUseEfficiency.maximumElectricalPower"
        unitName="dpp.energyUseEfficiency.maximumElectricalPowerUnit"
        placeholder="e.g., 100"
        defaultUnit="W"
      />

      <FieldWithUnit
        label={t("Maximum Voltage")}
        valueName="dpp.energyUseEfficiency.maximumVoltage"
        unitName="dpp.energyUseEfficiency.maximumVoltageUnit"
        placeholder="e.g., 100"
        defaultUnit="V"
      />

      <FieldWithUnit
        label={t("Maximum Current")}
        valueName="dpp.energyUseEfficiency.maximumCurrent"
        unitName="dpp.energyUseEfficiency.maximumCurrentUnit"
        placeholder="e.g., 100"
        defaultUnit="A"
      />

      <FieldWithUnit
        label={t("Power Rating")}
        valueName="dpp.energyUseEfficiency.powerRating"
        unitName="dpp.energyUseEfficiency.powerRatingUnit"
        placeholder="e.g., 100"
        defaultUnit="W"
      />

      <FieldWithUnit
        label={t("DC Voltage")}
        valueName="dpp.energyUseEfficiency.dcVoltage"
        unitName="dpp.energyUseEfficiency.dcVoltageUnit"
        placeholder="e.g., 100"
        defaultUnit="V"
      />
    </Stack>
  );
};
