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
import { locationStepDefaultValues, LocationStepSchemaContext, LocationStepValues } from "./steps/LocationStep";
import { mainStepDefaultValues, mainStepSchema, MainStepValues } from "./steps/MainStep";
import { relationsStepDefaultValues, relationsStepSchema, RelationsStepValues } from "./steps/RelationsStep";

// Partials
import CreateProjectFields from "./parts/CreateProjectFields";
import CreateProjectNav from "./parts/CreateProjectNav";
import CreateProjectSubmit from "./parts/CreateProjectSubmit";

// Components
import LoadingOverlay from "components/LoadingOverlay";

// Form
import { Spinner } from "@bbtgnn/polaris-interfacer";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "hooks/useAuth";
import { useDrafts } from "hooks/useFormSaveDraft";
import useYupLocaleObject from "hooks/useYupLocaleObject";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";

//@ts-ignore
import useSignedPost from "hooks/useSignedPost";
import { UploadFileOnDPP } from "lib/fileUpload";
import { dppStepDefaultValues, dppStepSchema, DPPStepValues } from "./steps/DPPStep";
import { machinesStepDefaultValues, machinesStepSchema, MachinesStepValues } from "./steps/MachinesStep";
import { materialsStepDefaultValues, materialsStepSchema, MaterialsStepValues } from "./steps/MaterialsStep";
import {
  productFiltersStepDefaultValues,
  productFiltersStepSchema,
  ProductFiltersStepValues,
} from "./steps/ProductFiltersStep";

export interface Props {
  projectType: ProjectType;
}

//

export interface CreateProjectValues {
  main: MainStepValues;
  productFilters: ProductFiltersStepValues;
  linkedDesign: LinkDesignStepValues;
  location: LocationStepValues;
  images: ImagesStepValues;
  declarations: DeclarationsStepValues;
  contributors: ContributorsStepValues;
  relations: RelationsStepValues;
  licenses: LicenseStepValues;
  dpp: DPPStepValues;
  machines: MachinesStepValues;
  materials: MaterialsStepValues;
}

export const createProjectDefaultValues: CreateProjectValues = {
  main: mainStepDefaultValues,
  productFilters: productFiltersStepDefaultValues,
  linkedDesign: linkDesignStepDefaultValues,
  location: locationStepDefaultValues,
  images: imagesStepDefaultValues,
  declarations: declarationsStepDefaultValues,
  contributors: contributorsStepDefaultValues,
  relations: relationsStepDefaultValues,
  licenses: licenseStepDefaultValues,
  dpp: dppStepDefaultValues,
  machines: machinesStepDefaultValues,
  materials: materialsStepDefaultValues,
};

export const createProjectSchema = () =>
  yup.object({
    main: mainStepSchema(),
    productFilters: productFiltersStepSchema(),
    linkedDesign: linkDesignStepSchema().when("$projectType", (projectType: ProjectType, schema) =>
      projectType == ProjectType.PRODUCT ? schema.required("A design source is required for products") : schema
    ),
    location: yup.object(), //re add condition to make location required only for product
    // .when("$projectType", (projectType: ProjectType, schema) =>
    //   projectType == ProjectType.DESIGN ? schema : locationStepSchema
    // ),
    images: imagesStepSchema(),
    declarations: yup
      .object()
      .when("$projectType", (projectType: ProjectType, schema) =>
        projectType == ProjectType.PRODUCT ? declarationsStepSchema : schema
      ),
    contributors: contributorsStepSchema(),
    relations: relationsStepSchema(),
    licenses: licenseStepSchema(),
    dpp: dppStepSchema().when("$projectType", (projectType: ProjectType, schema) =>
      projectType == ProjectType.PRODUCT
        ? schema.required("A DPP is required for products")
        : schema.notRequired().nullable()
    ),
    machines: machinesStepSchema(),
    materials: materialsStepSchema(),
  });

export type CreateProjectSchemaContext = LocationStepSchemaContext;

//

export default function CreateProjectForm(props: Props) {
  const { projectType } = props;
  const { handleProjectCreation, handleMachineCreation } = useProjectCRUD();
  const { signedPost } = useSignedPost();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const yupLocaleObject = useYupLocaleObject();
  yup.setLocale(yupLocaleObject);

  const { draft_id } = router.query;
  const { user } = useAuth();
  const { draft } = useDrafts(Number(draft_id));
  const [storedValues, setStoredValues] = useState<CreateProjectValues | undefined>(undefined);

  const locationStepDefaultUserValues: LocationStepValues | undefined = user?.primaryLocation
    ? {
        locationName: user.primaryLocation.name,
        locationData: {
          address: user.primaryLocation.mappableAddress!,
          lat: user.primaryLocation.lat,
          lng: user.primaryLocation.long,
        },
        remote: false,
      }
    : locationStepDefaultValues;

  const createProjectDefaultValues: CreateProjectValues = {
    main: mainStepDefaultValues,
    productFilters: productFiltersStepDefaultValues,
    linkedDesign: linkDesignStepDefaultValues,
    location: locationStepDefaultUserValues,
    images: imagesStepDefaultValues,
    declarations: declarationsStepDefaultValues,
    contributors: contributorsStepDefaultValues,
    relations: relationsStepDefaultValues,
    licenses: licenseStepDefaultValues,
    dpp: dppStepDefaultValues,
    machines: machinesStepDefaultValues,
    materials: materialsStepDefaultValues,
  };

  useEffect(() => {
    if (draft_id && !storedValues && draft) {
      setStoredValues(draft?.project);
    }
  }, [draft_id, draft, storedValues]);

  const formMethods = useForm<CreateProjectValues, CreateProjectSchemaContext>({
    mode: "all",
    resolver: yupResolver(createProjectSchema()),
    defaultValues: storedValues || createProjectDefaultValues,
    context: {
      projectType,
      isEdit: false,
    },
  });

  const { reset, formState, trigger } = formMethods;
  const { isDirty, isSubmitting } = formState;

  useEffect(() => {
    if (storedValues && !isSubmitting && !isDirty) {
      reset(storedValues);
      trigger();
    }
  }, [storedValues, isSubmitting, isDirty, reset, trigger]);

  const { handleSubmit } = formMethods;

  async function processDppValues(obj: any): Promise<any> {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (obj instanceof File) {
      const uploadResponse = await UploadFileOnDPP(obj);
      return uploadResponse;
    }
    if (Array.isArray(obj)) {
      return Promise.all(obj.map(item => processDppValues(item)));
    }
    if (typeof obj === "object") {
      const processedObj: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const processedValue = await processDppValues(obj[key]);
          if (processedValue && typeof processedValue === "object" && "value" in processedValue) {
            if (processedValue.value === null || processedValue.value === undefined) {
              continue;
            }
          }
          processedObj[key] = processedValue;
        }
      }
      return processedObj;
    }
    return obj;
  }

  async function onSubmit(values: CreateProjectValues) {
    setLoading(true);

    // For MACHINE type, create a machine resource instead of a project
    if (projectType === ProjectType.MACHINE) {
      const machineID = await handleMachineCreation(values);
      if (machineID) await router.replace(`/project/${machineID}?created=true`);
      setLoading(false);
      return;
    }

    let dppUlid: string | undefined = undefined;

    if (values.dpp) {
      const processedDpp = await processDppValues(values.dpp);
      const response = await signedPost(`${process.env.NEXT_PUBLIC_DPP_URL}/dpp`, processedDpp, true);
      if (!response.ok) {
        console.error("Failed to submit DPP:", response.statusText);
        setLoading(false);
        return;
      }
      dppUlid = (await response.json()).insertedID;
      console.log("DPP submitted with ULID:", dppUlid);
    }

    const projectID = await handleProjectCreation(values, projectType, dppUlid);
    if (projectID) await router.replace(`/project/${projectID}?created=true`);
    setLoading(false);
  }

  useEffect(() => {
    if (projectType == ProjectType.DESIGN) return;
    const field = document.getElementById("main.title");
    field?.focus();
  }, [projectType]);

  if (!storedValues && draft_id) return <Spinner />;

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div
          style={{
            backgroundImage: 'url("/formBg.png")',
          }}
          className="flex flex-row justify-center space-x-8 md:space-x-16 lg:space-x-24 p-6 bg-background-subdued min-h-screen"
        >
          <div className="max-w-xs">
            <div className="sticky top-24">
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
