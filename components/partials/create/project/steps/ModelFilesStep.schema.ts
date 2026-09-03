import * as yup from "yup";

export type ModelFilesStepValues = Array<{ url: string }>;

export const modelFilesStepSchema = () =>
  yup
    .array()
    .of(
      yup.object({
        url: yup.string().url().required(),
      })
    )
    .default([]);

export const modelFilesStepDefaultValues: ModelFilesStepValues = [];
