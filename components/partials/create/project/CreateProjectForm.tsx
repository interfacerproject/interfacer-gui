import { ProjectType } from "components/types";
import { useProjectCRUD } from "hooks/useProjectCRUD";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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

// Partials
import CreateProjectFields from "./parts/CreateProjectFields";
import CreateProjectNav from "./parts/CreateProjectNav";
import CreateProjectSubmit from "./parts/CreateProjectSubmit";

// Components
import LoadingOverlay from "components/LoadingOverlay";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";

//

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
      projectType == ProjectType.DESIGN ? schema : locationStepSchema
    ),
  images: imagesStepSchema,
  declarations: yup
    .object()
    .when("$projectType", (projectType: ProjectType, schema) =>
      projectType == ProjectType.PRODUCT ? declarationsStepSchema : schema
    ),
  contributors: contributorsStepSchema,
  relations: relationsStepSchema,
  licenses: licenseStepSchema,
});

export type CreateProjectSchemaContext = LocationStepSchemaContext;

//

export default function CreateProjectForm(props: Props) {
  const { projectType } = props;
  const { handleProjectCreation } = useProjectCRUD();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const formMethods = useForm<CreateProjectValues, CreateProjectSchemaContext>({
    mode: "all",
    resolver: yupResolver(createProjectSchema),
    defaultValues: createProjectDefaultValues,
    context: {
      projectType,
      isEdit: false,
    },
  });

  const { handleSubmit } = formMethods;

  async function onSubmit(values: CreateProjectValues) {
    setLoading(true);
    const projectID = await handleProjectCreation(values, projectType);
    if (projectID) await router.replace(`/project/${projectID}?created=true`);
    setLoading(false);
  }

  // Focus on first element
  useEffect(() => {
    if (projectType == ProjectType.DESIGN) return;
    const field = document.getElementById("main.title");
    field?.focus();
  }, [projectType]);

  //

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-row justify-center space-x-8 md:space-x-16 lg:space-x-24 p-6">
          <div className="max-w-xs">
            <div className="sticky top-8">
              <CreateProjectNav projectType={projectType} />
            </div>
          </div>
          <div className="max-w-xl pb-24">
            <CreateProjectFields projectType={projectType} onSubmit={onSubmit} />
          </div>
        </div>
        <CreateProjectSubmit />
      </form>

      {loading && <LoadingOverlay />}
    </FormProvider>
  );
}
