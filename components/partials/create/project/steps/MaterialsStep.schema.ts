import * as yup from "yup";

export interface MaterialsStepValues {
  materials: string[]; // Array of material resource IDs
  materialDetails: Array<{ id: string; name: string }>; // Used for save-time material-* tags
}

export const materialsStepDefaultValues: MaterialsStepValues = {
  materials: [],
  materialDetails: [],
};

export const materialsStepSchema = () =>
  yup.object().shape({
    materials: yup.array().of(yup.string().required()).default([]),
    materialDetails: yup
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
