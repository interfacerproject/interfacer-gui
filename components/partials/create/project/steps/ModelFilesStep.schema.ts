import * as yup from "yup";

export type ModelFilesStepValues = Array<File>;
export const modelFilesStepSchema = () => yup.array().default([]);
export const modelFilesStepDefaultValues: ModelFilesStepValues = [];
