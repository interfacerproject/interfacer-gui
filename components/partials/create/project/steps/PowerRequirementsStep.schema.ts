import * as yup from "yup";

export interface PowerRequirementsStepValues {
  powerSources: string[];
  powerRequirementW: string;
}

export const powerRequirementsStepDefaultValues: PowerRequirementsStepValues = {
  powerSources: [],
  powerRequirementW: "50",
};

export const powerRequirementsStepSchema = () =>
  yup.object().shape({
    powerSources: yup.array().of(yup.string().required()).default([]),
    powerRequirementW: yup
      .string()
      .test("is-number-or-empty", "Must be a number", value => {
        if (!value) return true;
        return Number.isFinite(Number(value));
      })
      .default("50"),
  });
