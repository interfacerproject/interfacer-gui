import * as yup from "yup";

export interface MachinesStepValues {
  machines: string[]; // Array of machine resource IDs
  machineDetails: Array<{ id: string; name: string }>; // Used for save-time machine-* tags
}

export const machinesStepDefaultValues: MachinesStepValues = {
  machines: [],
  machineDetails: [],
};

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
