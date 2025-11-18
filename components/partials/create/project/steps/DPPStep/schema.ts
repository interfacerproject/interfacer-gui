import * as yup from "yup";
import { DPPStepValues } from "./types";

export const dppStepSchema = () =>
  yup.object().nullable().shape({
    productOverview: yup.object().nullable(),
    repairability: yup.object().nullable(),
    environmentalImpact: yup.object().nullable(),
    compliance: yup.object().nullable(),
    certificates: yup.object().nullable(),
    recyclability: yup.object().nullable(),
    energyUseEfficiency: yup.object().nullable(),
    componentInformation: yup.array().nullable(),
    economicOperator: yup.object().nullable(),
    repairInformation: yup.object().nullable(),
    refurbishmentInformation: yup.object().nullable(),
    recyclingInformation: yup.object().nullable(),
  });

export const dppStepDefaultValues: DPPStepValues | null = null;
