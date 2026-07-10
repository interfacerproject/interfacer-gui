import * as yup from "yup";
import { SelectedLocation } from "components/SelectLocation";
import { ProjectType } from "components/types";

export interface LocationStepValues {
  locationName: string;
  locationData: SelectedLocation | null;
  remote: boolean;
}

export const locationStepDefaultValues: LocationStepValues = {
  locationName: "",
  locationData: null,
  remote: false,
};

function requiredWhenProduct(projectType: ProjectType, schema: yup.AnySchema) {
  return projectType === ProjectType.PRODUCT ? schema.required() : schema.nullable();
}

function requiredWhenLocationName(locationName: string, schema: yup.AnySchema) {
  return Boolean(locationName) ? schema.required() : schema.nullable();
}

function requiredWhenEdit(isEdit: boolean, schema: yup.AnySchema) {
  return isEdit ? schema.required() : schema.nullable();
}

export const locationStepSchema = yup.object().shape({
  locationName: yup.string().when("$projectType", requiredWhenProduct),
  locationData: yup
    .object({
      address: yup.string().required(),
      lat: yup.number().required(),
      lng: yup.number().required(),
    })
    .when("$projectType", requiredWhenProduct)
    .when("locationName", requiredWhenLocationName)
    .when("$isEdit", requiredWhenEdit),
  remote: yup.boolean(),
});

export interface LocationStepSchemaContext {
  projectType: ProjectType;
  isEdit: boolean;
}
