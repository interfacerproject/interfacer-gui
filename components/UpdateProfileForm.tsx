import { gql, useMutation } from "@apollo/client";
import { useTranslation } from "next-i18next";
import devLog from "../lib/devLog";
import { CREATE_LOCATION } from "../lib/QueryAndMutation";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, TextField } from "@bbtgnn/polaris-interfacer";
import { isRequired } from "../lib/isFieldRequired";
import SelectLocation from "./SelectLocation";
import { LocationLookup } from "../lib/fetchLocation";
import { CreateLocationMutation, Person, PersonResponse } from "../lib/types";

const UPDATE_USER = gql(`mutation ($name: String, $id: ID!, $note:String, $primaryLocation: ID, $user: String) {
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
    locationName: string;
    address: LocationLookup.Location | null;
    note: string;
  }

  export interface Props {
    locationId: string;
    lat: number;
    long: number;
    onSubmit: (data: FormValues) => void;
  }
}

const UpdateProfileForm = ({ person }: { person: Person }) => {
  const { t } = useTranslation("ProfileProps");

  const [createLocation] = useMutation(CREATE_LOCATION);

  const [updateUser] = useMutation(UPDATE_USER);

  const onSubmit = async (formData: UpdateUserNS.FormValues) => {
    try {
      const location = await handleCreateLocation(formData);
      const variables = {
        variables: {
          id: person.id,
          name: formData.name,
          note: formData.note,
          primaryLocation: location?.id,
          user: formData.username,
        },
      };
      devLog(await updateUser(variables));
    } catch (e) {
      devLog(e);
    }
  };
  const defaultValues: UpdateUserNS.FormValues = {
    name: person?.name || "",
    username: person?.user || "",
    locationName: person?.primaryLocation?.name || "",
    address: null,
    note: person?.note || "",
  };

  const schema = yup
    .object({
      name: yup.string(),
      username: yup.string(),
      locationName: yup.string(),
      address: yup.object(),
      note: yup.string(),
    })
    .required();

  const form = useForm<UpdateUserNS.FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { formState, handleSubmit, register, control } = form;
  const { errors } = formState;

  type SpatialThingRes = CreateLocationMutation["createSpatialThing"]["spatialThing"];

  async function handleCreateLocation(formData: UpdateUserNS.FormValues): Promise<SpatialThingRes | undefined> {
    try {
      const { data } = await createLocation({
        variables: {
          name: formData.locationName,
          addr: formData.address?.address.label!,
          lat: formData.address?.position.lat!,
          lng: formData.address?.position.lng!,
        },
      });
      const st = data?.createSpatialThing.spatialThing;
      devLog("success: location created", st);
      return st;
    } catch (e) {
      devLog("error: location not created", e);
      throw e;
    }
  }

  return (
    <form className="max-w-screen-md" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col">
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
              label={t("name")}
              requiredIndicator={isRequired(schema, name)}
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
              label={t("username")}
              requiredIndicator={isRequired(schema, name)}
            />
          )}
        />

        <div className="grid grid-cols-2 gap-2">
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
                placeholder={person?.primaryLocation?.mappableAddress || t("Hamburg")}
                error={errors.address?.message}
                creatable={false}
                requiredIndicator={isRequired(schema, name)}
              />
            )}
          />
        </div>

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
            />
          )}
        />
      </div>
      <div className="flex flex-col items-end mt-5">
        <Button size="large" primary submit id="submit">
          {t("Update")}
        </Button>
      </div>
    </form>
  );
};

export default UpdateProfileForm;
