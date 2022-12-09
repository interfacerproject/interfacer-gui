import { useTranslation } from "next-i18next";

// Request
import { useQuery } from "@apollo/client";
import { QUERY_ASSET_TYPES } from "lib/QueryAndMutation";
import { GetAssetTypesQuery } from "lib/types";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import { Button, Card, Spinner, Stack, TextField } from "@bbtgnn/polaris-interfacer";
import BrImageUpload from "components/brickroom/BrImageUpload";
import BrMdEditor from "components/brickroom/BrMdEditor";
import BrRadioOption from "components/brickroom/BrRadioOption";
import { ChildrenProp as CP } from "components/brickroom/types";
import PFieldInfo from "components/polaris/PFieldInfo";
import SelectContributors, { ContributorOption } from "components/SelectContributors";
import SelectLocation from "components/SelectLocation";
import SelectTags from "components/SelectTags";

// Types
import { LocationLookup } from "lib/fetchLocation";

// Other
import { SelectOption } from "components/brickroom/utils/BrSelectUtils";
import { isRequired } from "lib/isFieldRequired";
import SelectResources from "../../SelectResources";

//

export namespace CreateAssetNS {
  export interface Props extends CP {
    onSubmit: (data: FormValues) => void;
  }

  export interface FormValues {
    name: string;
    description: string;
    type: string;
    repositoryOrId: string;
    tags: Array<SelectOption<string>>;
    location: LocationLookup.Location | null;
    locationName: string;
    price: string;
    images: Array<File>;
    contributors: Array<ContributorOption>;
    resources: Array<ContributorOption>;
  }
}

//

export default function NewAssetForm(props: CreateAssetNS.Props) {
  const { onSubmit } = props;
  const { t } = useTranslation("createProjectProps");

  //

  // Loading asset types
  const queryAssetTypes = useQuery<GetAssetTypesQuery>(QUERY_ASSET_TYPES).data;
  const assetTypes = queryAssetTypes && [
    {
      name: t("Design"),
      id: queryAssetTypes.instanceVariables.specs.specProjectDesign.id,
      label: t("A digital asset, like an open source hardware project or 3D model"),
    },
    {
      name: t("Service"),
      id: queryAssetTypes.instanceVariables.specs.specProjectService.id,
      label: t("A service, like a consultancy, training course or usage/rental of equipment"),
    },
    {
      name: t("Product"),
      id: queryAssetTypes.instanceVariables.specs.specProjectProduct.id,
      label: t("A physical product that can be picked up or delivered"),
    },
  ];
  //

  const defaultValues: CreateAssetNS.FormValues = {
    name: "",
    description: "",
    type: "",
    repositoryOrId: "",
    tags: [],
    location: null,
    locationName: "",
    price: "1",
    images: [], //as Array<File>
    contributors: [], // Array<{id:string, name:string}>
    resources: [], // Array<{id:string, name:string}>
  };

  const schema = yup.object({
    name: yup.string().required(),
    description: yup.string().required(),
    type: yup.string().required(),
    repositoryOrId: yup.string().required(),
    tags: yup.array(yup.object()),
    location: yup.object().required(),
    locationName: yup.string().required(),
    price: yup.string().required(),
    images: yup.array(), // Array<File & {preview: string}>
    contributors: yup.array(
      yup
        .object({
          id: yup.string(),
          name: yup.string(),
        })
        .required()
    ),
    resources: yup.array(
      yup.object({
        id: yup.string(),
        name: yup.string(),
      })
    ),
  });

  const form = useForm<CreateAssetNS.FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { formState, handleSubmit, register, control, setValue, watch } = form;
  const { isValid, errors, isSubmitting } = formState;

  //

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full pt-12 space-y-12">
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
            label={t("Asset name")}
            placeholder={t("Fabulaser")}
            helpText={t("Working name of the asset, visible to the whole community")}
            error={errors.name?.message}
            requiredIndicator={isRequired(schema, name)}
          />
        )}
      />

      <BrMdEditor
        id="description"
        name="description"
        editorClass="h-60"
        label={t("General information")}
        helpText={`${t("In this markdown editor, the right box shows a preview")}. ${t("Type up to 2048 characters")}.`}
        subtitle={t("Short description to be displayed on the asset page")}
        onChange={({ text, html }) => {
          setValue("description", text);
        }}
        requiredIndicator={isRequired(schema, "description")}
        error={errors.description?.message}
      />

      <BrImageUpload
        {...register("images")}
        label={t("Upload up to 10 pictures")}
        helpText={t("SVG, PNG, JPG or GIF (MAX 2MB)")}
        id="images"
        onDrop={acceptedFiles => {
          console.log(acceptedFiles);
          setValue("images", acceptedFiles);
        }}
        error={errors.images?.message}
        requiredIndicator={isRequired(schema, "images")}
      />

      <Controller
        control={control}
        name="repositoryOrId"
        render={({ field: { onChange, onBlur, name, value } }) => (
          <TextField
            type="text"
            id={name}
            name={name}
            value={value}
            autoComplete="off"
            onChange={onChange}
            onBlur={onBlur}
            label={t("Repository link or Interfacer ID")}
            placeholder={t("github[dot]com/my-repo")}
            helpText={t("Reference to the asset's repository or Interfacer ID of the asset")}
            error={errors.repositoryOrId?.message}
            requiredIndicator={isRequired(schema, name)}
          />
        )}
      />

      <PFieldInfo
        label={`${t("Select asset type")}:`}
        error={errors.type?.message}
        requiredIndicator={isRequired(schema, "type")}
      >
        <Stack vertical spacing="tight">
          {assetTypes &&
            assetTypes.map(type => (
              <BrRadioOption
                id={type.id}
                value={type.id}
                label={type.name}
                description={type.label}
                {...register("type")}
                key={type.id}
                testID={`type-${type.name}`}
              />
            ))}
        </Stack>
      </PFieldInfo>

      <Controller
        control={control}
        name="tags"
        render={({ field: { onChange, onBlur, name, ref } }) => (
          <SelectTags
            name={name}
            id={name}
            ref={ref}
            onBlur={onBlur}
            onChange={onChange}
            label={`${t("Tags")}:`}
            isMulti
            placeholder={t("Open-source, 3D Printing, Medical use")}
            helpText={t("Select a tag from the list, or type to create a new one")}
            error={errors.tags?.message}
            creatable={true}
            requiredIndicator={isRequired(schema, name)}
          />
        )}
      />

      <Controller
        control={control}
        name="contributors"
        render={({ field: { onChange, onBlur, name, ref } }) => (
          <SelectContributors
            name={name}
            ref={ref}
            id={name}
            onBlur={onBlur}
            onChange={onChange}
            label={`${t("Contributors")}:`}
            isMulti
            placeholder={t("Type to search for a user")}
            error={errors.contributors?.message}
            creatable={false}
            requiredIndicator={isRequired(schema, name)}
          />
        )}
      />

      <Controller
        control={control}
        name="resources"
        render={({ field: { onChange, onBlur, name, ref } }) => (
          <SelectResources
            name={name}
            ref={ref}
            id={name}
            onBlur={onBlur}
            onChange={onChange}
            label={`${t("Include other resources")}:`}
            isMulti
            helpText={t("To include other resources, search by name or Interfacer ID")}
            placeholder={t("Search resource name")}
            error={errors.resources?.message}
            creatable={false}
            requiredIndicator={isRequired(schema, name)}
          />
        )}
      />

      <div className="space-y-4">
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
              helpText={t("The name of the place where the asset is stored")}
              error={errors.name?.message}
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
              label={t("Select the address")}
              placeholder={t("Hamburg")}
              error={errors.location?.message}
              creatable={false}
              requiredIndicator={isRequired(schema, name)}
            />
          )}
        />
      </div>

      {/* Slot to display errors, for example */}
      {props.children}

      {isSubmitting && (
        <Card>
          <div className="flex flex-col items-center justify-center p-4">
            <Spinner />
            <p className="pt-2">{`${t("Creating asset")}...`}</p>
          </div>
        </Card>
      )}

      <Button size="large" primary fullWidth submit disabled={!isValid || isSubmitting} id="submit">
        {t("Save")}
      </Button>
    </form>
  );
}
