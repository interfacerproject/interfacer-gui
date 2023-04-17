import { gql, useMutation } from "@apollo/client";
import { useProjectCRUD } from "hooks/useProjectCRUD";
import devLog from "lib/devLog";
import { useTranslation } from "next-i18next";
import { Person } from "../lib/types";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { isRequired } from "../lib/isFieldRequired";
import { LocationStepValues, locationStepSchema } from "./partials/create/project/steps/LocationStep";

// Partials
import ProfileImageEditor from "./partials/profile/[id]/ProfileImageEditor";
import EditFormLayout from "./partials/project/edit/EditFormLayout";

// Components
import { Card, Stack, TextField } from "@bbtgnn/polaris-interfacer";
import SelectLocation2 from "./SelectLocation2";
import TableOfContents from "./TableOfContents";
import PDivider from "./polaris/PDivider";
import PTitleSubtitle from "./polaris/PTitleSubtitle";

//

export interface UpdateProfileValues {
  name: string;
  address?: LocationStepValues;
  note: string;
}

export interface UpdateProfileProps {
  locationId: string;
  lat: number;
  long: number;
  onSubmit: (data: UpdateProfileValues) => void;
}

export default function UpdateProfileForm({ user }: { user: Partial<Person> }) {
  const { t } = useTranslation("common");
  const { handleCreateLocation } = useProjectCRUD();

  const [updateUser] = useMutation(UPDATE_USER);

  const sections = ["personal info", "location"];

  const onSubmit = async (formData: UpdateProfileValues) => {
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

  const defaultValues: UpdateProfileValues = {
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

  const form = useForm<UpdateProfileValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  function EditProfileNav() {
    const links = sections.map(section => ({
      label: <span className="capitalize">{section}</span>,
      href: `#${section.replace(" ", "-")}`,
    }));
    return <TableOfContents title={t("Edit Profile")} links={links} />;
  }

  const { formState, control, setValue, watch, trigger } = form;
  const { errors } = formState;

  const onImageChange = async (f: File) => {
    console.log(f);
  };

  return (
    <EditFormLayout nav={EditProfileNav()} formMethods={form} onSubmit={onSubmit}>
      <Stack vertical spacing="extraLoose">
        <PTitleSubtitle
          title={t("Update your profile")}
          subtitle={t("Edit your profile picture, bio and location info")}
        />
        <PDivider id={sections[0].replace(" ", "-")} />

        <Card sectioned>
          <Stack vertical spacing="extraLoose">
            <PTitleSubtitle
              title={t("Personal info")}
              subtitle={t("This information will be visible to any logged-in user")}
            />

            <ProfileImageEditor
              label={t("Avatar")}
              onChange={onImageChange}
              helpText={t("Upload a file or drag and drop.")}
              initialImage="https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8&w=1000&q=80"
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
                  helpText={t("Max. 860 ch")}
                  requiredIndicator={isRequired(schema, name)}
                  error={errors.note?.message}
                />
              )}
            />
          </Stack>
        </Card>
        <PDivider id={sections[1]} />
        <Card sectioned>
          <Stack vertical spacing="extraLoose">
            <PTitleSubtitle
              title={t("Set location")}
              subtitle={t(
                "We value your privacy and will only use your location for the purpose of connecting you with other members of the community"
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
              helpText={t("Start to type the address and select the correct one from the list")}
            />
          </Stack>
        </Card>
      </Stack>
    </EditFormLayout>
  );
}

//

const UPDATE_USER = gql`
  mutation updateUser($name: String, $id: ID!, $note: String, $primaryLocation: ID, $user: String) {
    updatePerson(person: { id: $id, name: $name, note: $note, primaryLocation: $primaryLocation, user: $user }) {
      agent {
        id
        name
        note
        primaryLocation {
          id
          lat
          long
          name
        }
      }
    }
  }
`;
