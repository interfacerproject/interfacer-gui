import * as yup from "yup";

export type ImagesStepValues = Array<File>;
export const imagesStepSchema = () => yup.array().min(1).required();
export const imagesStepDefaultValues: ImagesStepValues = [];
