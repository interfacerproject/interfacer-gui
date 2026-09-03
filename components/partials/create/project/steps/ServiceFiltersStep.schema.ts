import * as yup from "yup";

export interface ServiceFiltersStepValues {
  serviceType: string[];
  availability: string[];
}

export const serviceFiltersStepDefaultValues: ServiceFiltersStepValues = {
  serviceType: [],
  availability: [],
};

export const serviceFiltersStepSchema = () =>
  yup.object().shape({
    serviceType: yup.array().of(yup.string().required()).default([]),
    availability: yup.array().of(yup.string().required()).default([]),
  });
