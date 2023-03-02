import { Checkbox, Stack, TextField } from "@bbtgnn/polaris-interfacer";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import SelectLocation2, { SelectedLocation } from "components/SelectLocation2";
import { ProjectType } from "components/types";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { useTranslation } from "next-i18next";
import { Controller, useFormContext } from "react-hook-form";
import * as yup from "yup";
import { CreateProjectValues } from "../CreateProjectForm";

//

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

//

export interface Props extends Partial<LocationStepSchemaContext> {
  projectType: ProjectType.PRODUCT | ProjectType.SERVICE;
}

//

export default function LocationStepProduct(props: Props) {
  const { projectType, isEdit = false } = props;
  const { t } = useTranslation("createProjectProps");

  const { setValue, control, formState, watch, trigger } = useFormContext<CreateProjectValues>();
  const { errors } = formState;

  const isLocationRequired = projectType == ProjectType.PRODUCT || Boolean(watch("location.locationName")) || isEdit;

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle title={t("Set location")} />

      <Controller
        control={control}
        name="location.locationName"
        render={({ field: { onChange, onBlur, name, value } }) => (
          <TextField
            type="text"
            id={name}
            name={name}
            value={value}
            autoComplete="off"
            onChange={value => {
              onChange(value), trigger("location.locationData");
            }}
            onBlur={() => {
              onBlur(), trigger("location.locationData");
            }}
            label={t("Location name")}
            helpText={t("For example: My Workshop")}
            error={errors.location?.locationName?.message}
            requiredIndicator={projectType == ProjectType.PRODUCT}
          />
        )}
      />

      <SelectLocation2
        label={t("Address")}
        placeholder={t("An d. Alsterschleife 3, 22399 - Hamburg, Germany")}
        location={watch("location.locationData")}
        setLocation={value => setValue("location.locationData", value, formSetValueOptions)}
        error={errors.location?.locationData?.message}
        requiredIndicator={isLocationRequired}
      />

      {projectType == ProjectType.SERVICE && (
        <Checkbox
          id="remote"
          name="remote"
          onChange={value => setValue("location.remote", value, formSetValueOptions)}
          checked={watch("location.remote")}
          label={t("This service happens remotely / online")}
          error={errors.location?.remote?.message}
        />
      )}
    </Stack>
  );
}
