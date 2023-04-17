import { gql, useMutation } from "@apollo/client";
import { useProjectCRUD } from "hooks/useProjectCRUD";
import { useTranslation } from "next-i18next";
import { IFile, Person, UpdateUserMutation, UpdateUserMutationVariables } from "../lib/types";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { isRequired } from "../lib/isFieldRequired";
import { LocationStepValues } from "./partials/create/project/steps/LocationStep";

// Partials
import ProfileImageEditor from "./partials/profile/[id]/ProfileImageEditor";

// Components
import { Card, Stack, TextField } from "@bbtgnn/polaris-interfacer";
import devLog from "lib/devLog";
import { prepFileForZenflows, uploadFile } from "lib/fileUpload";
import { createImageSrc } from "lib/resourceImages";
import TableOfContents from "./TableOfContents";
import EditFormLayout from "./partials/project/edit/EditFormLayout";
import PDivider from "./polaris/PDivider";
import PTitleSubtitle from "./polaris/PTitleSubtitle";

//

export interface UpdateProfileValues {
  name: string;
  // address?: LocationStepValues;
  note: string;
  image: File | null;
}

export default function UpdateProfileForm(props: { user: Partial<Person> }) {
  const { user } = props;

  const { t } = useTranslation("common");
  const { handleCreateLocation } = useProjectCRUD();

  /* */

  let userImg = undefined;
  if (user.images && user.images[0]) userImg = createImageSrc(user.images[0]);

  /* */

  const sections = ["personal info", "location"];

  function EditProfileNav() {
    const links = sections.map(section => ({
      label: <span className="capitalize">{section}</span>,
      href: `#${section.replace(" ", "-")}`,
    }));
    return <TableOfContents title={t("Edit Profile")} links={links} />;
  }

  /* */

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
    // address: defaultAddress,
    note: user?.note || "",
    image: null,
  };

  const schema = yup.object({
    name: yup.string(),
    // address: locationStepSchema,
    note: yup.string(),
    image: yup.object().nullable(),
  });

  const form = useForm<UpdateProfileValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { formState, control, setValue, watch, trigger, handleSubmit } = form;
  const { errors } = formState;

  const onImageChange = async (f: File) => {
    setValue("image", f, formSetValueOptions);
  };

  //

  const [updateUser] = useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UPDATE_USER);

  const onSubmit = async (formData: UpdateProfileValues) => {
    formData = watch();
    try {
      // let location = undefined;
      // if (formData.address) location = await handleCreateLocation(formData.address, false);

      let images = user.images as Array<IFile>;
      if (formData.image) images = [await prepFileForZenflows(formData.image)];

      const variables: UpdateUserMutationVariables = {
        id: user.id!,
        name: formData.name,
        note: formData.note,
        images,
        // primaryLocation: location?.st?.id,
      };

      await updateUser({ variables });
      if (formData.image) await uploadFile(formData.image);
    } catch (e) {
      devLog(e);
    }
  };

  //

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
              image={watch("image")}
              onChange={onImageChange}
              helpText={t("Upload a file or drag and drop.")}
              initialImage={userImg}
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
            {/* <Controller
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
            /> */}
          </Stack>
        </Card>
      </Stack>
    </EditFormLayout>
  );
}

//

const UPDATE_USER = gql`
  mutation updateUser($id: ID!, $name: String, $note: String, $primaryLocation: ID, $user: String, $images: [IFile!]) {
    updatePerson(
      person: { id: $id, name: $name, note: $note, primaryLocation: $primaryLocation, user: $user, images: $images }
    ) {
      agent {
        id
        name
        note
        images {
          name
        }
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
