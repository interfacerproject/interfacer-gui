// Steps
import {
  contributorsStepDefaultValues,
  contributorsStepSchema,
  ContributorsStepValues,
} from "./steps/ContributorsStep";
import {
  declarationsStepDefaultValues,
  declarationsStepSchema,
  DeclarationsStepValues,
} from "./steps/DeclarationsStep";
import { imagesStepDefaultValues, imagesStepSchema, ImagesStepValues } from "./steps/ImagesStep";
import { licenseStepDefaultValues, licenseStepSchema, LicenseStepValues } from "./steps/LicenseStep";
import { linkDesignStepDefaultValues, linkDesignStepSchema, LinkDesignStepValues } from "./steps/LinkDesignStep";
import {
  locationStepDefaultValues,
  locationStepSchema,
  LocationStepSchemaContext,
  LocationStepValues,
} from "./steps/LocationStep";
import { mainStepDefaultValues, mainStepSchema, MainStepValues } from "./steps/MainStep";
import { relationsStepDefaultValues, relationsStepSchema, RelationsStepValues } from "./steps/RelationsStep";

// Components
import CreateProjectFields from "./parts/CreateProjectFields";
import CreateProjectNav from "./parts/CreateProjectNav";
import CreateProjectSubmit from "./parts/CreateProjectSubmit";

import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";

//

export type ProjectType = "service" | "product" | "design";

export interface Props {
  projectType: ProjectType;
}

//

export interface CreateProjectValues {
  main: MainStepValues;
  linkedDesign: LinkDesignStepValues;
  location: LocationStepValues;
  images: ImagesStepValues;
  declarations: DeclarationsStepValues;
  contributors: ContributorsStepValues;
  relations: RelationsStepValues;
  licenses: LicenseStepValues;
}

export const createProjectDefaultValues: CreateProjectValues = {
  main: mainStepDefaultValues,
  linkedDesign: linkDesignStepDefaultValues,
  location: locationStepDefaultValues,
  images: imagesStepDefaultValues,
  declarations: declarationsStepDefaultValues,
  contributors: contributorsStepDefaultValues,
  relations: relationsStepDefaultValues,
  licenses: licenseStepDefaultValues,
};

export const createProjectSchema = yup.object({
  main: mainStepSchema,
  linkedDesign: linkDesignStepSchema,
  location: yup
    .object()
    .when("$projectType", (projectType: ProjectType, schema) =>
      projectType == "design" ? schema : locationStepSchema
    ),
  images: imagesStepSchema,
  declarations: yup
    .object()
    .when("$projectType", (projectType: ProjectType, schema) =>
      projectType == "product" ? declarationsStepSchema : schema
    ),
  contributors: contributorsStepSchema,
  relations: relationsStepSchema,
  licenses: licenseStepSchema,
});

export type CreateProjectSchemaContext = LocationStepSchemaContext;

//

export default function CreateProjectForm(props: Props) {
  const { projectType } = props;

  const formMethods = useForm<CreateProjectValues, CreateProjectSchemaContext>({
    mode: "all",
    resolver: yupResolver(createProjectSchema),
    defaultValues: createProjectDefaultValues,
    context: {
      projectType,
    },
  });

  function onSubmit(values: CreateProjectValues) {
    console.log(values);
  }

  //

  return (
    <FormProvider {...formMethods}>
      <div className="flex flex-row justify-center space-x-6 md:space-x-16 lg:space-x-24 p-6">
        <div className="max-w-xs">
          <div className="sticky top-8">
            <CreateProjectNav projectType={projectType} />
          </div>
        </div>
        <div className="max-w-xl">
          <CreateProjectFields projectType={projectType} onSubmit={onSubmit} />
        </div>
      </div>
      <CreateProjectSubmit />
    </FormProvider>
  );
}
