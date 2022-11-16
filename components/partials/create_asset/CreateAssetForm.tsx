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
import BrFieldInfo from "components/brickroom/BrFieldInfo";
import BrImageUpload from "components/brickroom/BrImageUpload";
import BrInput from "components/brickroom/BrInput";
import BrMdEditor from "components/brickroom/BrMdEditor";
import BrRadioOption from "components/brickroom/BrRadioOption";
import SelectContributors from "components/SelectContributors";
import SelectLocation from "components/SelectLocation";
import SelectTags from "components/SelectTags";

// Types
import type { Contributor } from "components/TagsGeoContributors";
import { LocationLookup } from "lib/fetchLocation";

// Other
import { assetTypesQueryToArray } from "lib/formatAssetTypes";

//

export namespace CreateAssetNS {
  export interface Props {
    onSubmit: (data: FormValues) => void;
  }

  export interface FormValues {
    name: string;
    description: string;
    type: string;
    repositoryOrId: string;
    tags: Array<string>;
    location: LocationLookup.Location | null;
    locationName: string;
    price: string;
    images: Array<File>;
    contributors: Array<Contributor>;
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
  };

  const schema = yup
    .object({
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
        yup.object({
          id: yup.string(),
          name: yup.string(),
        })
      ),
    })
    .required();

  const form = useForm<CreateAssetNS.FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { formState, handleSubmit, register, control, setValue, watch } = form;
  const { isValid, errors } = formState;

  //

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full pt-12 space-y-12">
      <BrInput
        {...register("name")}
        label={t("Asset name")}
        hint={t("Working name of the asset, visible to the whole community")}
        placeholder={t("Fabulaser")}
        testID="assetName"
        error={errors.name?.message}
      />

      <BrMdEditor
        name="description"
        editorClass="h-60"
        label={t("General information")}
        hint={t("in this markdown editor, the right box shows a preview; Type up to 2048 characters")}
        testID="assetDescription"
        subtitle={t("Short description to be displayed on the asset page")}
        onChange={({ text, html }) => {
          setValue("description", text);
        }}
        error={errors.description?.message}
      />

      <BrImageUpload
        {...register("images")}
        label={t("Upload up to 10 pictures")}
        hint={t("SVG, PNG, JPG or GIF (MAX 2MB)")}
        testID="imageUpload"
        onDrop={acceptedFiles => {
          setValue("images", acceptedFiles);
        }}
        error={errors.images?.message}
      />

      <BrInput
        {...register("repositoryOrId")}
        name="repositoryOrId"
        label={t("Repository link or Interfacer ID")}
        hint={t("Reference to the asset's repository or Interfacer ID of the asset")}
        placeholder={t("github&#46;com/my-repo")}
        testID="repositoryOrId"
        error={errors.repositoryOrId?.message}
      />

      <BrFieldInfo label={t("Select asset type") + ":*"} error={errors.type?.message}>
        {assetTypes &&
          assetTypes.map(type => (
            <BrRadioOption
              id={type.id}
              value={type.id}
              label={type.name}
              description={type.label}
              {...register("type")}
              key={type.id}
              testID={`type-${type.id}`}
            />
          ))}
      </BrFieldInfo>

      {/* Form cntroller for tags field */}
      <Controller
        control={control}
        name="tags"
        render={({ field: { onChange, onBlur, name, ref } }) => (
          <SelectTags
            name={name}
            ref={ref}
            onBlur={onBlur}
            onChange={onChange}
            label={t("Tags") + ":"}
            isMulti
            placeholder={t("")}
            error={errors.tags?.message}
            creatable={true}
            testID="selectTags"
          />
        )}
      />

      {/* Form cntroller for contributors field */}
      <Controller
        control={control}
        name="contributors"
        render={({ field: { onChange, onBlur, name, ref } }) => (
          <SelectContributors
            name={name}
            ref={ref}
            onBlur={onBlur}
            onChange={onChange}
            label={t("Contributors") + ":"}
            isMulti
            placeholder={t("")}
            error={errors.contributors?.message}
            creatable={false}
            testID="SelectContributors"
          />
        )}
      />

      <div className="space-y-4">
        {/* Location name */}
        <BrInput
          {...register("locationName")}
          type="text"
          label={t("")}
          hint={t("")}
          placeholder={t("")}
          testID="locationName"
        />

        {/* Form cntroller for location field */}
        <Controller
          control={control}
          name="location"
          render={({ field: { onChange, onBlur, name, ref } }) => (
            <SelectLocation
              name={name}
              ref={ref}
              onBlur={onBlur}
              onChange={onChange}
              label={t("Select location") + ":*"}
              placeholder={t("Hamburg")}
              error={errors.location?.message}
              creatable={false}
              testID="selectLocation"
            />
          )}
        />
      </div>

      <button type="submit" className="btn btn-accent" disabled={!isValid} data-test="submit">
        {t("Save")}
      </button>
    </form>
  );
}
