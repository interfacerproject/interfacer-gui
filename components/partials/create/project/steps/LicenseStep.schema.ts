import * as yup from "yup";

export type LicenseStepValues = Array<{ scope: string; licenseId: string }>;
export const licenseStepSchema = () =>
  yup.array().of(yup.object().shape({ scope: yup.string(), licenseId: yup.string() }));
export const licenseStepDefaultValues: LicenseStepValues = [];
