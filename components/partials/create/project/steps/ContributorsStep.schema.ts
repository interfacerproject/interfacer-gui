import * as yup from "yup";

export type ContributorsStepValues = Array<string>;
export const contributorsStepSchema = () => yup.array().of(yup.string().required());
export const contributorsStepDefaultValues: ContributorsStepValues = [];
