import { Stack, Tag } from "@bbtgnn/polaris-interfacer";
import PHelp from "components/polaris/PHelp";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import SearchMachines from "components/SearchMachines";
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
  machineDetails: Array<{ id: string; name: string }>; // Used for save-time machine-* tags
}

export const machinesStepDefaultValues: MachinesStepValues = {
  machines: [],
  machineDetails: [],
};

//
// Schema
//

export const machinesStepSchema = () =>
  yup.object().shape({
    machines: yup.array().of(yup.string().required()).default([]),
    machineDetails: yup
      .array()
      .of(
        yup
          .object({
            id: yup.string().required(),
            name: yup.string().required(),
          })
          .required()
      )
      .default([]),
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

  const selectedMachines = machinesData?.machineDetails || [];

  const [machinesEnabled, setMachinesEnabled] = useState(Boolean(machinesData && machinesData.machines.length > 0));

  // Handle machines toggle
  const handleMachinesToggle = () => {
    const newState = !machinesEnabled;
    setMachinesEnabled(newState);
    if (!newState) {
      setValue(MACHINES_FORM_KEY, { machines: [], machineDetails: [] });
    } else {
      // Initialize with empty array when enabling
      setValue(MACHINES_FORM_KEY, { machines: [], machineDetails: [] });
    }
  };

  // Handle machine selection
  const handleMachineSelect = (machine: { id: string; name: string }) => {
    const currentMachines = machinesData?.machines || [];
    if (!currentMachines.includes(machine.id)) {
      const newMachines = [...currentMachines, machine.id];
      setValue(MACHINES_FORM_KEY, {
        machines: newMachines,
        machineDetails: [...selectedMachines, { id: machine.id, name: machine.name }],
      });
    }
  };

  // Handle machine removal
  const handleMachineRemove = (machineId: string) => {
    const currentMachines = machinesData?.machines || [];
    const newMachines = currentMachines.filter((id: string) => id !== machineId);
    setValue(MACHINES_FORM_KEY, {
      machines: newMachines,
      machineDetails: selectedMachines.filter(m => m.id !== machineId),
    });
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

      {/* Machines selection interface */}
      {machinesEnabled && (
        <Stack vertical spacing="tight">
          {/* Search and select machines */}
          <SearchMachines
            onSelect={handleMachineSelect}
            excludeIDs={machinesData?.machines || []}
            label={t("Add machines")}
            placeholder={t("Search for machines")}
          />

          {/* Display selected machines as chips */}
          {selectedMachines.length > 0 && (
            <div className="mt-2">
              <p className="mb-2 text-sm font-medium">{t("Selected machines")}:</p>
              <Stack spacing="tight" wrap>
                {selectedMachines.map(machine => (
                  <Tag key={machine.id} onRemove={() => handleMachineRemove(machine.id)}>
                    {machine.name}
                  </Tag>
                ))}
              </Stack>
            </div>
          )}
        </Stack>
      )}
    </Stack>
  );
}
