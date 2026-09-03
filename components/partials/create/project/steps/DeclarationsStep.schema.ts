import * as yup from "yup";
import { Link as ILink } from "components/AddLink";

yup.setLocale({
  mixed: {
    required: "Required",
  },
  string: {
    url: "Invalid URL",
  },
});

const YES_NO = ["yes", "no"] as const;

export interface DeclarationsStepValues {
  repairable: string;
  recyclable: string;
  certifications: Array<ILink>;
}

export const declarationsStepSchema = yup.object({
  repairable: yup
    .string()
    .required()
    .oneOf([...YES_NO]),
  recyclable: yup
    .string()
    .required()
    .oneOf([...YES_NO]),
  certifications: yup.array().of(
    yup.object().shape({
      url: yup.string().url().required(),
      label: yup.string().required(),
    })
  ),
});

export const declarationsStepDefaultValues: DeclarationsStepValues = {
  repairable: "",
  recyclable: "",
  certifications: [],
};
