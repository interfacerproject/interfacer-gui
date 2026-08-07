import { RangeSlider, Stack } from "@bbtgnn/polaris-interfacer";
import PHelp from "components/polaris/PHelp";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { CreateProjectValues } from "../CreateProjectForm";

export {
  type PowerRequirementsStepValues,
  powerRequirementsStepDefaultValues,
  powerRequirementsStepSchema,
} from "./PowerRequirementsStep.schema";

// Power source options matching the Figma prototype's design form.
export const DESIGN_POWER_SOURCE_OPTIONS = [
  "110V AC",
  "230V AC",
  "12V DC",
  "5V DC",
  "Battery Powered",
  "USB-C PD",
  "Solar Compatible",
];

export default function PowerRequirementsStep() {
  const { t } = useTranslation("createProjectProps");
  const form = useFormContext<CreateProjectValues>();
  const { watch, setValue } = form;

  const POWER_FORM_KEY = "power";
  const powerData = watch(POWER_FORM_KEY);
  const selectedSources = powerData?.powerSources || [];

  const currentW = Number(powerData?.powerRequirementW) || 0;
  const [watts, setWatts] = useState(currentW);

  const toggleSource = (source: string, checked: boolean) => {
    const next = checked ? [...selectedSources, source] : selectedSources.filter(s => s !== source);
    setValue(POWER_FORM_KEY, { ...powerData, powerSources: next }, formSetValueOptions);
  };

  return (
    <Stack vertical spacing="loose">
      <PTitleSubtitle title={t("Power Requirements")} />
      <PHelp helpText={t("Specify the power source and consumption of your project.")} />

      <div className="flex flex-col gap-3">
        <div className="text-ifr-text-primary" style={{ fontWeight: 600, fontSize: "var(--ifr-fs-md)" }}>
          {t("Power Source")}
        </div>
        <div className="flex flex-wrap gap-2">
          {DESIGN_POWER_SOURCE_OPTIONS.map(source => {
            const checked = selectedSources.includes(source);
            return (
              <label
                key={source}
                className="flex items-center gap-2 cursor-pointer select-none px-3 py-2 border transition-colors"
                style={{
                  borderRadius: "var(--ifr-radius-sm)",
                  borderColor: checked ? "var(--ifr-green)" : "var(--ifr-border)",
                  backgroundColor: checked ? "var(--ifr-active)" : "var(--ifr-surface)",
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-sm)",
                  fontWeight: checked ? "var(--ifr-fw-medium)" : "var(--ifr-fw-regular)",
                  color: "var(--ifr-text-primary)",
                }}
              >
                <input
                  type="checkbox"
                  className="accent-[var(--ifr-green)]"
                  checked={checked}
                  onChange={e => toggleSource(source, e.target.checked)}
                />
                {t(source)}
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-ifr-text-primary" style={{ fontWeight: 600, fontSize: "var(--ifr-fs-md)" }}>
          {t("Power Requirement (Watts)")}
        </div>
        <RangeSlider
          id="power-requirement-watts"
          label={t("Power Requirement (Watts)")}
          labelHidden
          min={0}
          max={1500}
          step={25}
          value={watts}
          output
          onChange={v => {
            const n = Number(v);
            setWatts(n);
            setValue(POWER_FORM_KEY, { ...powerData, powerRequirementW: String(n) }, formSetValueOptions);
          }}
        />
        <div className="flex items-center gap-1 text-ifr-text-primary" style={{ fontSize: "var(--ifr-fs-base)" }}>
          <span style={{ fontWeight: "var(--ifr-fw-medium)" }}>{watts}</span>
          <span className="text-ifr-text-secondary">{t("W")}</span>
        </div>
      </div>
    </Stack>
  );
}
