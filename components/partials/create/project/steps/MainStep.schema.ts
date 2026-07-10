import * as yup from "yup";

export interface MainStepValues {
  title: string;
  description: string;
  link: string;
  tags: Array<string>;
}

export const mainStepDefaultValues: MainStepValues = {
  title: "",
  description: "",
  link: "",
  tags: [],
};

export const mainStepSchema = () =>
  yup.object({
    title: yup.string().required(),
    link: yup.string().url().required(),
    tags: yup.array().of(yup.string()),
    description: yup
      .string()
      .test(
        "size-check",
        "Description length must be less than 6000 characters. If it's longer, please use the 'project data' field to reference it.",
        value => {
          if (value) return new Blob([value]).size < 6000;
          else return true;
        }
      ),
  });
