import { gql, useMutation } from "@apollo/client";
import { useTranslation } from "next-i18next";
import {
  CreateLocationMutation,
  CreateLocationMutationVariables,
  Person,
  UpdateUserMutation,
  UpdateUserMutationVariables,
} from "../lib/types";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { isRequired } from "../lib/isFieldRequired";

// Partials
import ProfileImageEditor from "./partials/profile/[id]/ProfileImageEditor";

// Components
import { Card, Stack, TextField } from "@bbtgnn/polaris-interfacer";
import { CREATE_LOCATION } from "lib/QueryAndMutation";
import devLog from "lib/devLog";
import { prepFileForZenflows, uploadFile } from "lib/fileUpload";
import { createImageSrc, fileToIfile } from "lib/resourceImages";
import { useRouter } from "next/router";
import SelectLocation2, { SelectedLocation } from "./SelectLocation2";
import TableOfContents from "./TableOfContents";
import EditFormLayout from "./partials/project/edit/EditFormLayout";
import PDivider from "./polaris/PDivider";
import PTitleSubtitle from "./polaris/PTitleSubtitle";

//

export interface UpdateProfileValues {
  name: string;
  address: SelectedLocation | null;
  note: string;
  image: File | null;
}

export default function UpdateProfileForm(props: { user: Partial<Person> }) {
  const { user } = props;
  const { t } = useTranslation("common");
  const router = useRouter();

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

  const defaultAddress: UpdateProfileValues["address"] = user?.primaryLocation
    ? {
        address: user?.primaryLocation?.mappableAddress!,
        lat: user?.primaryLocation?.lat!,
        lng: user?.primaryLocation?.long!,
      }
    : null;

  const defaultValues: UpdateProfileValues = {
    name: user?.name || "",
    address: defaultAddress,
    note: user?.note || "",
    image: null,
  };

  const schema = yup.object({
    name: yup.string(),
    address: yup
      .object({
        address: yup.string().required(),
        lat: yup.number().required(),
        lng: yup.number().required(),
      })
      .nullable(),
    note: yup.string(),
    image: yup.object().nullable(),
  });

  const form = useForm<UpdateProfileValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { formState, control, setValue, watch, trigger, handleSubmit } = form;
  const { errors, touchedFields } = formState;

  const onImageChange = async (f: File) => {
    setValue("image", f, formSetValueOptions);
  };

  //

  const [createLocation] = useMutation<CreateLocationMutation, CreateLocationMutationVariables>(CREATE_LOCATION);
  const [updateUser] = useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UPDATE_USER);

  const onSubmit = async (formData: UpdateProfileValues) => {
    formData = watch();
    try {
      const variables: UpdateUserMutationVariables = {
        id: user.id!,
        name: formData.name,
        note: formData.note,
        primaryLocation: user.primaryLocation?.id,
        images: user.images?.map(img => fileToIfile(img)),
      };

      if (touchedFields.address) {
        const locData = formData.address;
        if (!locData) variables.primaryLocation = null;
        else {
          const location = await createLocation({
            variables: {
              addr: locData.address,
              name: locData.address,
              lat: locData.lat,
              lng: locData.lng,
            },
          });
          variables.primaryLocation = location.data?.createSpatialThing.spatialThing.id!;
        }
      }

      if (touchedFields.image) {
        variables.images = [await prepFileForZenflows(formData.image!)];
      }

      await updateUser({ variables });
      if (formData.image) await uploadFile(formData.image);
    } catch (e) {
      devLog(e);
    }
  };

  // Success route
  const updateSuccessPath = `${location.pathname}?success=true`;

  //

  return (
    <EditFormLayout nav={EditProfileNav()} formMethods={form} onSubmit={onSubmit} redirect={updateSuccessPath}>
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
            <SelectLocation2
              label={t("Address")}
              placeholder={t("An d. Alsterschleife 3, 22399 - Hamburg, Germany")}
              location={watch("address")}
              setLocation={value => setValue("address", value, formSetValueOptions)}
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
