import * as yup from "yup";

export type RelationsStepValues = Array<string>;
export const relationsStepSchema = () => yup.array().of(yup.string().required());
export const relationsStepDefaultValues: RelationsStepValues = [];
