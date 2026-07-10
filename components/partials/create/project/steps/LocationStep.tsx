import { Checkbox, Stack, TextField } from "@bbtgnn/polaris-interfacer";
import SelectLocation from "components/SelectLocation";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { ProjectType } from "components/types";
import { formSetValueOptions } from "lib/formSetValueOptions";
import getIdFromFormName from "lib/getIdFromFormName";
import { useTranslation } from "next-i18next";
import { Controller, useFormContext } from "react-hook-form";
import { CreateProjectValues } from "../CreateProjectForm";

import {
  type LocationStepValues,
  locationStepDefaultValues,
  locationStepSchema,
  type LocationStepSchemaContext,
} from "./LocationStep.schema";
export { type LocationStepValues, locationStepDefaultValues, locationStepSchema, type LocationStepSchemaContext };

//

export interface Props extends Partial<LocationStepSchemaContext> {
  projectType: ProjectType.PRODUCT | ProjectType.SERVICE | ProjectType.MACHINE;
}

//

export default function LocationStepProduct(props: Props) {
  const { projectType, isEdit = false } = props;
  const { t } = useTranslation("createProjectProps");

  const { setValue, control, formState, watch, trigger } = useFormContext<CreateProjectValues>();
  const { errors } = formState;

  // const isLocationRequired = projectType == ProjectType.PRODUCT || Boolean(watch("location.locationName")) || isEdit;

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
            id={getIdFromFormName(name)}
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
            // requiredIndicator={projectType == ProjectType.PRODUCT}
          />
        )}
      />

      <SelectLocation
        id="search-location"
        label={t("Address")}
        placeholder={t("An d. Alsterschleife 3, 22399 - Hamburg, Germany")}
        location={watch("location.locationData")}
        setLocation={value => setValue("location.locationData", value, formSetValueOptions)}
        error={errors.location?.locationData?.message}
        // requiredIndicator={isLocationRequired}
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
