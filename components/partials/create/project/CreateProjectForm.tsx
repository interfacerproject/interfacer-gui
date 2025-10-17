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
import { zenroom_exec } from "zenroom";

//@ts-ignore
import validationScript from "components/interfacer-dpp/validation/strdict_to_dpp.lua";
import { dppStepDefaultValues, DPPStepValues } from "./steps/DPPStep";
// import validationKeys from "components/interfacer-dpp/validation/dataTypes.json";
const validationKeys = {
  boolean: ["ceMarking", "rohsCompliance", "conformityAssessmentCE", "euDeclarationOfConformityID"],
  date: ["dateOfRecycling", "dateOfRefurbishment", "dateOfRepair"],
  link: ["linkToDPP", "productImage", "serviceAndRepairInstructions"],
  quantity: [
    "dcVoltage",
    "maximumCurrent",
    "maximumElectricalPower",
    "maximumVoltage",
    "powerRating",
    "chemicalConsumptionPerUnit",
    "co2\neEmissionsPerUnit",
    "energyConsumptionPerUnit",
    "waterConsumptionPerUnit",
    "netContent",
    "netWeight",
    "nominalMaximumRPM",
    "numberOfGears",
    "torque",
    "warrantyDuration",
    "co2eEmissionsPerUnit",
    "voltage",
    "energy",
    "thermalCoefficient",
    "lightTransmittance",
    "amount",
    "minimumRecycledContent",
    "recyclablePackaging",
    "netContentCapacity",
    ".*PowerCapability.*",
    "handleHeight",
    "weight",
    "capacityThresholdExhaustion",
  ],
  dimensions: ["dimensions", "size"],
};

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
  dpp: DPPStepValues
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
  dpp: dppStepDefaultValues,
};

export const createProjectSchema = () =>
  yup.object({
    main: mainStepSchema(),
    linkedDesign: linkDesignStepSchema(),
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
    dpp: yup
      .object()
      .when("$projectType", (projectType: ProjectType, schema) =>
        projectType == ProjectType.PRODUCT
          ? schema.required("A DPP is required for products")
          : schema.notRequired().nullable()
      ),
  });

export type CreateProjectSchemaContext = LocationStepSchemaContext;

//

export default function CreateProjectForm(props: Props) {
  const { projectType } = props;
  const { handleProjectCreation } = useProjectCRUD();
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
    linkedDesign: linkDesignStepDefaultValues,
    location: locationStepDefaultUserValues,
    images: imagesStepDefaultValues,
    declarations: declarationsStepDefaultValues,
    contributors: contributorsStepDefaultValues,
    relations: relationsStepDefaultValues,
    licenses: licenseStepDefaultValues,
    dpp: dppStepDefaultValues,
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

  async function onSubmit(values: CreateProjectValues) {
    setLoading(true);

    let dppUlid: string | undefined = undefined;

    const key= localStorage.getItem("eddsaKey");

    if (values.dpp) {
      console.log("Submitting DPP:", JSON.stringify([values.dpp]));
      const p = await zenroom_exec(validationScript, {
        data: JSON.stringify([values.dpp]),
        keys: JSON.stringify(validationKeys),
        // keys: key
      });
      if (p.result === null) {
        console.error("Zenroom DPP parsing error:", p.logs);
        setLoading(false);
        return;
      }
      console.log(p.result)

      const response = await fetch(`${process.env.NEXT_PUBLIC_DPP_URL}/dpp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(JSON.parse(p.result)[values.dpp.productOverview?.brandName || ""]),
      });
      if (!response.ok) {
        console.error("Failed to submit DPP:", response.statusText);
        setLoading(false);
        return;
      }
      dppUlid = (await response.json()).insertedID;
    }

    const projectID = await handleProjectCreation(values, projectType, dppUlid);
    if (projectID) await router.replace(`/project/${projectID}?created=true`);
    setLoading(false);
  }

  //Focus on first element
  useEffect(() => {
    if (projectType == ProjectType.DESIGN) return;
    const field = document.getElementById("main.title");
    field?.focus();
  }, [projectType]);

  if (!storedValues && draft_id) return <Spinner />;

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-row justify-center space-x-8 md:space-x-16 lg:space-x-24 p-6">
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
