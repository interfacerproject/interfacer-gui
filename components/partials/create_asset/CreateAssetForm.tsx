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
// Importing translations to check for data structure
import strings from "public/locales/en/createProjectProps.json";
type ProjectType = typeof strings.projectType.array[0];

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
  const assetTypes = queryAssetTypes && assetTypesQueryToArray(queryAssetTypes);

  // Loading asset types text
  const assetTypesTexts: Array<ProjectType> = t("projectType.array", { returnObjects: true });
  const getAssetTypeDesc = (id: string): string => {
    return assetTypesTexts.filter(t => t.id == id)[0].description;
  };

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
        label={t("projectName.label")}
        hint={t("projectName.hint")}
        placeholder={t("projectName.placeholder")}
        testID="assetName"
        error={errors.name?.message}
      />

      <BrMdEditor
        name="description"
        editorClass="h-60"
        label={t("projectDescription.label")}
        hint={t("projectDescription.hint")}
        testID="assetDescription"
        subtitle={t("projectDescription.md-editor-explainer")}
        onChange={({ text, html }) => {
          setValue("description", text);
        }}
        error={errors.description?.message}
      />

      <BrImageUpload
        {...register("images")}
        label={t("imageUpload.label")}
        hint={t("imageUpload.hint")}
        testID="imageUpload"
        onDrop={acceptedFiles => {
          setValue("images", acceptedFiles);
        }}
        error={errors.images?.message}
      />

      <BrInput
        {...register("repositoryOrId")}
        name="repositoryOrId"
        label={t("repositoryOrId.label")}
        hint={t("repositoryOrId.hint")}
        placeholder={t("repositoryOrId.placeholder")}
        testID="repositoryOrId"
        error={errors.repositoryOrId?.message}
      />

      <BrFieldInfo label={t("projectType.label")} error={errors.type?.message}>
        {assetTypes &&
          assetTypes.map(type => (
            <BrRadioOption
              id={type.id}
              value={type.id}
              label={type.name}
              description={getAssetTypeDesc(type.name)}
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
            label={t("projectTags.label")}
            isMulti
            placeholder={t("projectTags.placeholder")}
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
            label={t("contributors.label")}
            isMulti
            placeholder={t("contributors.placeholder")}
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
          label={t("location.name.label")}
          hint={t("location.name.hint")}
          placeholder={t("location.name.placeholder")}
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
              label={t("location.address.label")}
              placeholder={t("location.address.placeholder")}
              error={errors.location?.message}
              creatable={false}
              testID="selectLocation"
            />
          )}
        />
      </div>

      <button type="submit" className="btn btn-accent" disabled={!isValid} data-test="submit">
        {t("button")}
      </button>
    </form>
  );
}
