import { gql, useMutation } from "@apollo/client";
import { Stack, TextField } from "@bbtgnn/polaris-interfacer";
import { yupResolver } from "@hookform/resolvers/yup";
import { useProjectCRUD } from "hooks/useProjectCRUD";
import devLog from "lib/devLog";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { useTranslation } from "next-i18next";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { isRequired } from "../lib/isFieldRequired";
import { Person } from "../lib/types";
import { locationStepSchema, LocationStepValues } from "./partials/create/project/steps/LocationStep";
import EditFormLayout from "./partials/project/edit/EditFormLayout";
import PTitleSubtitle from "./polaris/PTitleSubtitle";
import SelectLocation2 from "./SelectLocation2";

const UPDATE_USER =
  gql(`mutation updateUser($name: String, $id: ID!, $note:String, $primaryLocation: ID, $user: String) {
    updatePerson(person: { id: $id, name:$name, note: $note, primaryLocation: $primaryLocation, user: $user}) {
      agent {
        id
        name
        note
        primaryLocation{
          id
          lat
          long
          name
        }
      }
    }
  }
  `);

export namespace UpdateUserNS {
  export interface FormValues {
    name: string;
    username: string;
    address?: LocationStepValues;
    note: string;
  }

  export interface Props {
    locationId: string;
    lat: number;
    long: number;
    onSubmit: (data: FormValues) => void;
  }
}

const UpdateProfileForm = ({ user }: { user: Partial<Person> }) => {
  const { t } = useTranslation("ProfileProps");
  console.log("popopopopopopopoopopopo", user);

  const { handleCreateLocation } = useProjectCRUD();

  const [updateUser] = useMutation(UPDATE_USER);

  const onSubmit = async (formData: UpdateUserNS.FormValues) => {
    console.log(formData);
    try {
      let location = undefined;
      if (formData.address) location = await handleCreateLocation(formData.address, false);
      const variables = {
        variables: {
          id: user.id,
          name: formData.name,
          note: formData.note,
          primaryLocation: location?.st?.id,
          user: formData.username,
        },
      };
      devLog(await updateUser(variables));
    } catch (e) {
      devLog(e);
    }
  };
  const defaultLocationData = {
    address: user?.primaryLocation?.mappableAddress || "",
    lat: user?.primaryLocation?.lat,
    lng: user?.primaryLocation?.long,
  };

  const defaultAddress: LocationStepValues = {
    locationName: user.primaryLocation?.name || "",
    locationData: defaultLocationData || null,
    remote: false,
  };

  const defaultValues: UpdateUserNS.FormValues = {
    name: user?.name || "",
    username: user?.user || "",
    address: defaultAddress,
    note: user?.note || "",
  };

  const schema = yup
    .object({
      name: yup.string(),
      username: yup.string(),
      locationName: yup.string(),
      address: locationStepSchema,
      note: yup.string(),
    })
    .required();

  const form = useForm<UpdateUserNS.FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { formState, handleSubmit, register, control, setValue, watch, trigger } = form;
  const { errors } = formState;
  devLog("ppppppp", formState, formState.isValid, formState.isDirty, errors);

  return (
    <EditFormLayout nav formMethods={form} onSubmit={onSubmit}>
      <Stack vertical spacing="extraLoose">
        <PTitleSubtitle
          title={t("Update your profile")}
          subtitle={t("This information will be visible to other users")}
        />
        <Controller
          control={control}
          // @ts-ignore
          name="name"
          render={({ field: { onChange, onBlur, name, value } }) => (
            <TextField
              type="text"
              id={name}
              name={name}
              value={value}
              autoComplete="off"
              onChange={onChange}
              onBlur={onBlur}
              label={t("Your name")}
              helpText={t("This will be your public name")}
              requiredIndicator={isRequired(schema, name)}
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          // @ts-ignore
          name="username"
          render={({ field: { onChange, onBlur, name, value } }) => (
            <TextField
              type="text"
              id={name}
              name={name}
              value={value}
              autoComplete="off"
              onChange={onChange}
              onBlur={onBlur}
              label={t("Your username")}
              helpText={t("This will be your public username")}
              requiredIndicator={isRequired(schema, name)}
              error={errors.username?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="address.locationName"
          render={({ field: { onChange, onBlur, name, value } }) => (
            <TextField
              type="text"
              id={name}
              name={name}
              value={value}
              autoComplete="off"
              onChange={value => {
                onChange(value), trigger("address.locationData");
              }}
              onBlur={() => {
                onBlur(), trigger("address.locationData");
              }}
              label={t("Location name")}
              helpText={t("For example: My Workshop")}
              error={errors.address?.locationName?.message}
            />
          )}
        />

        <SelectLocation2
          label={t("Address")}
          placeholder={t("An d. Alsterschleife 3, 22399 - Hamburg, Germany")}
          location={watch("address.locationData")}
          setLocation={value => setValue("address.locationData", value, formSetValueOptions)}
        />

        {/* <div className="grid grid-cols-2 gap-2">
          <Controller
            control={control}
            // @ts-ignore
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
                label={t("location")}
                requiredIndicator={isRequired(schema, name)}
                error={errors.locationName?.message}
              />
            )}
          />
          
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, onBlur, name, ref } }) => (
              <SelectLocation
                id={name}
                name={name}
                ref={ref}
                onBlur={onBlur}
                onChange={onChange}
                label={t("Select the address")}
                placeholder={user?.primaryLocation?.mappableAddress || t("Hamburg")}
                error={errors.address?.message}
                creatable={false}
                requiredIndicator={isRequired(schema, name)}
              />
            )}
          />
        </div> */}

        <Controller
          control={control}
          // @ts-ignore
          name="note"
          render={({ field: { onChange, onBlur, name, value } }) => (
            <TextField
              type="text"
              id={name}
              multiline={5}
              name={name}
              value={value}
              autoComplete="off"
              onChange={onChange}
              onBlur={onBlur}
              label={t("Note")}
              requiredIndicator={isRequired(schema, name)}
              error={errors.note?.message}
            />
          )}
        />
      </Stack>
    </EditFormLayout>
  );
};

export default UpdateProfileForm;
