import * as yup from "yup";

export type LinkDesignStepValues = string;
export const linkDesignStepSchema = () => yup.string();
export const linkDesignStepDefaultValues: LinkDesignStepValues = "";
