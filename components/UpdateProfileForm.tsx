import { gql, useMutation } from "@apollo/client";
import { Stack, TextField, Text } from "@bbtgnn/polaris-interfacer";
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
  const { t } = useTranslation("common");
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
        },
      };
      await updateUser(variables);
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
    address: defaultAddress,
    note: user?.note || "",
  };

  const schema = yup
    .object({
      name: yup.string(),
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
  function EditProfileNav() {
    return (
      <div className="space-y-2">
        <div className="border-b-1 pb-1 border-border-subdued px-2">
          <Text as="p" variant="bodySm" color="subdued">
            <span className="uppercase font-bold">{"Edit Profile"}</span>
          </Text>
        </div>
      </div>
    );
  }

  const { formState, control, setValue, watch, trigger } = form;
  const { errors } = formState;

  return (
    <EditFormLayout nav={EditProfileNav()} formMethods={form} onSubmit={onSubmit}>
      <Stack vertical spacing="extraLoose">
        <PTitleSubtitle
          title={t("Update your profile")}
          subtitle={t("This information will be visible to other users")}
        />
        <Controller
          control={control}
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

        <Controller
          control={control}
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
              label={t("Bio:")}
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
