import { Checkbox, Stack, TextField } from "@bbtgnn/polaris-interfacer";
import { yupResolver } from "@hookform/resolvers/yup";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import SelectLocation from "components/SelectLocation";
import { LocationLookup } from "lib/fetchLocation";
import { isRequired } from "lib/isFieldRequired";
import { useTranslation } from "next-i18next";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

//

export interface Values {
  locationName: string;
  location: LocationLookup.Location | null;
  remote: boolean;
}

export interface Props {
  onValid?: (values: Values) => void;
  projectType?: "product" | "service";
}

//

export default function LocationStepProduct(props: Props) {
  const { onValid = () => {}, projectType = "service" } = props;
  const { t } = useTranslation();

  const defaultValues: Values = {
    locationName: "",
    location: null,
    remote: false,
  };

  const locationError = t("Please search for a location");

  const serviceSchema = yup.object().shape({
    locationName: yup.string(),
    location: yup.object(),
    remote: yup.boolean(),
  });
  const projectSchema = yup.object().shape({
    locationName: yup.string(),
    location: yup.object().required(locationError),
    remote: yup.boolean(),
  });
  const schema = projectType == "service" ? serviceSchema : projectSchema;

  const form = useForm<Values>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { formState, control, watch } = form;
  const { errors, isValid } = formState;

  if (isValid) onValid(form.getValues());

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle title={t("Set location")} subtitle={t("Please read our Documentation Guidelines.")} />

      <Controller
        control={control}
        name="locationName"
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
            error={errors[name]?.message}
            requiredIndicator={isRequired(schema, name)}
          />
        )}
      />

      <Controller
        control={control}
        name="location"
        render={({ field: { onChange, onBlur, name, ref } }) => (
          <SelectLocation
            id={name}
            name={name}
            ref={ref}
            onBlur={onBlur}
            onChange={onChange}
            label={t("Search the full address")}
            placeholder={t("Hamburg, Boxhagener Str. 3")}
            error={errors[name]?.message ? locationError : ""}
            creatable={false}
            requiredIndicator={isRequired(schema, name)}
          />
        )}
      />

      {projectType == "service" && (
        <Checkbox
          id="remote"
          name="remote"
          onChange={value => form.setValue("remote", value)}
          checked={watch("remote")}
          label={t("This service happens remotely / online")}
          error={errors["remote"]?.message}
        />
      )}
    </Stack>
  );
}
