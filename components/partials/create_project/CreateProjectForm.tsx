// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { useTranslation } from "next-i18next";

// Request
import { useQuery } from "@apollo/client";
import { QUERY_PROJECT_TYPES } from "lib/QueryAndMutation";
import { GetProjectTypesQuery } from "lib/types";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import { Button, Card, Select, Spinner, Stack, TextField } from "@bbtgnn/polaris-interfacer";
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

export namespace CreateProjectNS {
  export interface Props extends CP {
    onSubmit: (data: FormValues) => void;
  }

  export interface FormValues {
    name: string;
    description: string;
    type: string;
    repo: string;
    tags: Array<SelectOption<string>>;
    location: LocationLookup.Location | null;
    locationName: string;
    license: string;
    price: string;
    images: Array<File>;
    contributors: Array<ContributorOption>;
    resources: Array<ContributorOption>;
  }
}

//

export default function NewProjectForm(props: CreateProjectNS.Props) {
  const { onSubmit } = props;
  const { t } = useTranslation("createProjectProps");

  //

  // Loading project types
  const queryProjectTypes = useQuery<GetProjectTypesQuery>(QUERY_PROJECT_TYPES).data;
  const projectTypes = queryProjectTypes && [
    {
      name: t("Design"),
      id: queryProjectTypes.instanceVariables.specs.specProjectDesign.id,
      label: t("A digital project, like an open source hardware project or 3D model"),
    },
    {
      name: t("Service"),
      id: queryProjectTypes.instanceVariables.specs.specProjectService.id,
      label: t("A service, like a consultancy, training course or usage/rental of equipment"),
    },
    {
      name: t("Product"),
      id: queryProjectTypes.instanceVariables.specs.specProjectProduct.id,
      label: t("A physical product that can be picked up or delivered"),
    },
  ];

  const licenseTypes = [
    "Creative Commons - Attribution",
    "Creative Commons - Attribution - Share Alike",
    "Creative Commons - Attribution - No Derivatives",
    "Creative Commons - Attribution - Non-Commercial ",
    "Creative Commons - Attribution - Non-Commercial - Share Alike",
    "Creative Commons - Attribution - Non-commercial - No Derivatives",
    "Creative Commons - Public Domain Dedication",
    "GNU - GPL ",
    "GNU - LGPL ",
    "BSD License",
    "CERN OSL",
  ];

  //

  const defaultValues: CreateProjectNS.FormValues = {
    name: "",
    description: "",
    type: "",
    repo: "",
    tags: [],
    location: null,
    locationName: "",
    license: "",
    price: "1",
    images: [], //as Array<File>
    contributors: [], // Array<{id:string, name:string}>
    resources: [], // Array<{id:string, name:string}>
  };

  const schema = yup.object({
    name: yup.string().required(),
    description: yup.string().required(),
    type: yup.string().required(),
    repo: yup.string().required(),
    tags: yup.array(yup.object()).min(1).required(),
    location: yup.object().required(),
    license: yup.string().oneOf(licenseTypes).required(),
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

  const form = useForm<CreateProjectNS.FormValues>({
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
            label={t("Project name")}
            placeholder={t("Fabulaser")}
            helpText={t("Working name of the project, visible to the whole community")}
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
        subtitle={t("Short description to be displayed on the project page")}
        onChange={({ text, html }) => {
          setValue("description", text, { shouldValidate: true });
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
          setValue("images", acceptedFiles, { shouldValidate: true });
        }}
        error={errors.images?.message}
        requiredIndicator={isRequired(schema, "images")}
      />

      <Controller
        control={control}
        name="repo"
        render={({ field: { onChange, onBlur, name, value } }) => (
          <TextField
            type="text"
            id={name}
            name={name}
            value={value}
            autoComplete="off"
            onChange={onChange}
            onBlur={onBlur}
            label={t("Repository link")}
            placeholder={t("github[dot]com/my-repo")}
            helpText={t("Reference to the project's repository (GitHub, Thingiverse, etc.)")}
            error={errors.repo?.message}
            requiredIndicator={isRequired(schema, name)}
          />
        )}
      />

      <Controller
        control={control}
        name="license"
        render={({ field: { onChange, onBlur, name, value } }) => (
          <Select
            options={licenseTypes}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            label={t("Select license type")}
            error={errors.license?.message}
            requiredIndicator={isRequired(schema, name)}
            placeholder={t("Select license type")}
          />
        )}
      />

      <PFieldInfo
        label={`${t("Select project type")}:`}
        error={errors.type?.message}
        requiredIndicator={isRequired(schema, "type")}
      >
        <Stack vertical spacing="tight">
          {projectTypes &&
            projectTypes.map(type => (
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
            helpText={t("Select a tag from the list, or type to create a new one | Min. 1 tag")}
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
          <div>
            <SelectContributors
              name={name}
              ref={ref}
              className="mb-0"
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
            {/*{form.watch("contributors").map(contributor => (*/}
            {/*  <div className="bg-white border-y-4 p-1" key={contributor.value.id}>*/}
            {/*    <h4>{contributor.label}</h4>*/}
            {/*    <div className="flex">*/}
            {/*      <div className="flex gap-2">*/}
            {/*        <TextField*/}
            {/*          type="number"*/}
            {/*          autoComplete="off"*/}
            {/*          value="0"*/}
            {/*          label={t("effort")}*/}
            {/*          helpText={t("The effort in hours")}*/}
            {/*        />*/}
            {/*        <TextField*/}
            {/*          type="number"*/}
            {/*          value="0"*/}
            {/*          autoComplete="off"*/}
            {/*          label={t("strenght points")}*/}
            {/*          helpText={t("Strenght points assigned")}*/}
            {/*        />*/}
            {/*        <TextField*/}
            {/*          type="text"*/}
            {/*          autoComplete="off"*/}
            {/*          label={t("Type of contribution")}*/}
            {/*          placeholder={t("Write documetation, design, etc")}*/}
            {/*          helpText={t("Use imperative verbs")}*/}
            {/*        />*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*  </div>*/}
            {/*))}*/}
          </div>
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
              helpText={t("The name of the place where the project is stored")}
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
            <p className="pt-2">{`${t("Creating project")}...`}</p>
          </div>
        </Card>
      )}

      <Button size="large" primary fullWidth submit disabled={!isValid || isSubmitting} id="submit">
        {t("Save")}
      </Button>
    </form>
  );
}
