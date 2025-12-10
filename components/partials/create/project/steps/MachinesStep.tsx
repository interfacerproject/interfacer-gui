import { Stack } from "@bbtgnn/polaris-interfacer";
import PHelp from "components/polaris/PHelp";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import * as yup from "yup";
import { CreateProjectValues } from "../CreateProjectForm";

//
// Types
//

export interface MachinesStepValues {
  machines: string[]; // Array of machine resource IDs
}

export const machinesStepDefaultValues: MachinesStepValues = {
  machines: [],
};

//
// Schema
//

export const machinesStepSchema = () =>
  yup.object().shape({
    machines: yup.array().of(yup.string().required()).default([]),
  });

//
// Component
//

export default function MachinesStep() {
  const { t } = useTranslation("createProjectProps");
  const form = useFormContext<CreateProjectValues>();

  const MACHINES_FORM_KEY = "machines";

  const { watch, setValue } = form;
  const machinesData = watch(MACHINES_FORM_KEY);

  // State for toggle
  const [machinesEnabled, setMachinesEnabled] = useState(Boolean(machinesData && machinesData.machines.length > 0));

  // Handle machines toggle
  const handleMachinesToggle = () => {
    const newState = !machinesEnabled;
    setMachinesEnabled(newState);
    if (!newState) {
      setValue(MACHINES_FORM_KEY, { machines: [] });
    } else {
      // Initialize with empty array when enabling
      setValue(MACHINES_FORM_KEY, { machines: [] });
    }
  };

  return (
    <Stack vertical spacing="loose">
      {/* Header with title and help text */}
      <PTitleSubtitle title={t("Machines Used")} />
      <PHelp helpText={t("Select the machines used to create this project")} />

      {/* Toggle to enable/disable machines */}
      <button
        type="button"
        onClick={handleMachinesToggle}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          machinesEnabled ? "bg-green-600" : "bg-gray-300"
        }`}
      >
        <span className="sr-only">{t("Enable machines")}</span>
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            machinesEnabled ? "translate-x-4" : "translate-x-1"
          }`}
        />
      </button>

      {/* TODO: Add machines selection UI here */}
      {machinesEnabled && (
        <Stack vertical spacing="tight">
          <p className="text-sm text-gray-500">
            {t("Machines selection UI will be implemented in task interfacer-gui-9lv.4")}
          </p>
          <p className="text-sm text-gray-500">
            {t("machines_selected_count", { count: machinesData?.machines?.length || 0 })}
          </p>
        </Stack>
      )}
    </Stack>
  );
}
