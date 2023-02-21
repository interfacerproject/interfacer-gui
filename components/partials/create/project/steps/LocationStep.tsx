import { Checkbox, Stack, TextField } from "@bbtgnn/polaris-interfacer";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import SelectLocation2 from "components/SelectLocation2";
import { ProjectType } from "components/types";
import { LocationLookup } from "lib/fetchLocation";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { useTranslation } from "next-i18next";
import { Controller, useFormContext } from "react-hook-form";
import * as yup from "yup";
import { CreateProjectValues } from "../CreateProjectForm";

//

export interface LocationStepValues {
  locationName: string;
  location: LocationLookup.Location | null;
  remote: boolean;
}

export const locationStepDefaultValues: LocationStepValues = {
  locationName: "",
  location: null,
  remote: false,
};

export const locationStepSchema = yup.object().shape({
  locationName: yup
    .string()
    .when("$projectType", (projectType: ProjectType, schema) =>
      projectType === ProjectType.PRODUCT ? schema.required() : schema.nullable()
    ),
  location: yup
    .object()
    .when("$projectType", (projectType: ProjectType, schema) =>
      projectType === ProjectType.PRODUCT ? schema.required() : schema.nullable()
    ),
  remote: yup.boolean(),
});

export interface LocationStepSchemaContext {
  projectType: ProjectType;
}

//

export interface Props {
  projectType?: Exclude<ProjectType, ProjectType.DESIGN>;
}

//

export default function LocationStepProduct(props: Props) {
  const { projectType = "product" } = props;
  const { t } = useTranslation();

  const { setValue, control, formState, watch } = useFormContext<CreateProjectValues>();
  const { errors } = formState;

  const locationError = t("Please select a location");

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle title={t("Set location")} subtitle={t("Please read our Documentation Guidelines.")} />

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
            onChange={onChange}
            onBlur={onBlur}
            label={t("Location name")}
            placeholder={t("Cool fablab")}
            helpText={t("The name of the place where the project is stored")}
            error={errors.location?.locationName?.message}
            requiredIndicator={projectType == ProjectType.PRODUCT}
          />
        )}
      />

      <Controller
        control={control}
        name="location.location"
        render={({ field: { onChange, onBlur, name, ref } }) => (
          <SelectLocation2
            id={name}
            name={name}
            ref={ref}
            onBlur={onBlur}
            onChange={onChange}
            label={t("Search the full address")}
            placeholder={t("Hamburg, Boxhagener Str. 3")}
            error={errors.location?.location ? locationError : ""}
            creatable={false}
            requiredIndicator={projectType == ProjectType.PRODUCT}
            isClearable
          />
        )}
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
