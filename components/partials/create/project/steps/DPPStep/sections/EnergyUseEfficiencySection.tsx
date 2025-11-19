import { Stack } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import { ControlledTextField } from "../components/ControlledTextField";
import { FieldWithUnit } from "../components/FieldWithUnit";

export const EnergyUseEfficiencySection = () => {
  const { t } = useTranslation("createProjectProps");

  return (
    <Stack vertical spacing="loose">
      <ControlledTextField name="dpp.energyUseAndEfficiency.batteryType.value" label={t("Battery Type")} />

      <FieldWithUnit
        label={t("Battery Charging Time")}
        valueName="dpp.energyUseAndEfficiency.batteryChargingTime.value"
        unitName="dpp.energyUseAndEfficiency.batteryChargingTime.units"
        placeholder="e.g., 10000 min"
        defaultUnit="min"
      />

      <FieldWithUnit
        label={t("Battery Life")}
        valueName="dpp.energyUseAndEfficiency.batteryLife.value"
        unitName="dpp.energyUseAndEfficiency.batteryLife.units"
        placeholder="e.g., 10000 min"
        defaultUnit="min"
      />

      <ControlledTextField name="dpp.energyUseAndEfficiency.chargerType.value" label={t("Charger Type")} />

      <FieldWithUnit
        label={t("Maximum Electrical Power")}
        valueName="dpp.energyUseAndEfficiency.maximumElectricalPower.value"
        unitName="dpp.energyUseAndEfficiency.maximumElectricalPower.units"
        placeholder="e.g., 100"
        defaultUnit="W"
      />

      <FieldWithUnit
        label={t("Maximum Voltage")}
        valueName="dpp.energyUseAndEfficiency.maximumVoltage.value"
        unitName="dpp.energyUseAndEfficiency.maximumVoltage.units"
        placeholder="e.g., 100"
        defaultUnit="V"
      />

      <FieldWithUnit
        label={t("Maximum Current")}
        valueName="dpp.energyUseAndEfficiency.maximumCurrent.value"
        unitName="dpp.energyUseAndEfficiency.maximumCurrent.units"
        placeholder="e.g., 100"
        defaultUnit="A"
      />

      <FieldWithUnit
        label={t("Power Rating")}
        valueName="dpp.energyUseAndEfficiency.powerRating.value"
        unitName="dpp.energyUseAndEfficiency.powerRating.units"
        placeholder="e.g., 100"
        defaultUnit="W"
      />

      <FieldWithUnit
        label={t("DC Voltage")}
        valueName="dpp.energyUseAndEfficiency.dcVoltage.value"
        unitName="dpp.energyUseAndEfficiency.dcVoltage.units"
        placeholder="e.g., 100"
        defaultUnit="V"
      />
    </Stack>
  );
};
