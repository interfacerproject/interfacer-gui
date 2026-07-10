import * as yup from "yup";

export interface ProductFiltersStepValues {
  categories: string[];
  powerCompatibility: string[];
  powerRequirementW: string;
  replicability: string[];
  recyclabilityPct: string;
  repairability: boolean;
  energyKwh: string;
  co2Kg: string;
}

export const productFiltersStepDefaultValues: ProductFiltersStepValues = {
  categories: [],
  powerCompatibility: [],
  powerRequirementW: "",
  replicability: [],
  recyclabilityPct: "",
  repairability: false,
  energyKwh: "",
  co2Kg: "",
};

export const productFiltersStepSchema = () =>
  yup.object().shape({
    categories: yup.array().of(yup.string().required()).default([]),
    powerCompatibility: yup.array().of(yup.string().required()).default([]),
    powerRequirementW: yup
      .string()
      .test("is-number-or-empty", "Must be a number", value => {
        if (!value) return true;
        return Number.isFinite(Number(value));
      })
      .default(""),
    replicability: yup.array().of(yup.string().required()).default([]),
    recyclabilityPct: yup
      .string()
      .test("is-pct-or-empty", "Must be a number between 0 and 100", value => {
        if (!value) return true;
        const n = Number(value);
        return Number.isFinite(n) && n >= 0 && n <= 100;
      })
      .default(""),
    repairability: yup.boolean().default(false),
    energyKwh: yup
      .string()
      .test("is-number-or-empty", "Must be a number", value => {
        if (!value) return true;
        return Number.isFinite(Number(value));
      })
      .default(""),
    co2Kg: yup
      .string()
      .test("is-number-or-empty", "Must be a number", value => {
        if (!value) return true;
        return Number.isFinite(Number(value));
      })
      .default(""),
  });
