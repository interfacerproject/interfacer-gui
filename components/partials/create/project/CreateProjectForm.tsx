import { useTranslation } from "next-i18next";

// Steps
import ContributorsStep, {
  contributorsStepDefaultValues,
  contributorsStepSchema,
  ContributorsStepValues,
} from "./ContributorsStep";
import DeclarationsStep, {
  declarationsStepDefaultValues,
  declarationsStepSchema,
  DeclarationsStepValues,
} from "./DeclarationsStep";
import ImagesStep, { imagesStepDefaultValues, imagesStepSchema, ImagesStepValues } from "./ImagesStep";
import ImportDesignStep from "./ImportDesignStep";
import LicenseStep, { licenseStepDefaultValues, licenseStepSchema, LicenseStepValues } from "./LicenseStep";
import LinkDesignStep, {
  linkDesignStepDefaultValues,
  linkDesignStepSchema,
  LinkDesignStepValues,
} from "./LinkDesignStep";
import LocationStep, {
  locationStepDefaultValues,
  locationStepSchema,
  LocationStepSchemaContext,
  LocationStepValues,
} from "./LocationStep";
import MainStep, { mainStepDefaultValues, mainStepSchema, MainStepValues } from "./MainStep";
import RelationsStep, { relationsStepDefaultValues, relationsStepSchema, RelationsStepValues } from "./RelationsStep";

// Components
import { Stack } from "@bbtgnn/polaris-interfacer";
import PDivider from "components/polaris/PDivider";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";

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
  location: locationStepSchema,
  images: imagesStepSchema,
  declarations: declarationsStepSchema,
  contributors: contributorsStepSchema,
  relations: relationsStepSchema,
  licenses: licenseStepSchema,
});

//

export default function CreateProjectForm(props: Props) {
  const { t } = useTranslation();
  const { projectType } = props;

  //

  const methods = useForm<CreateProjectValues, LocationStepSchemaContext>({
    mode: "all",
    resolver: yupResolver(createProjectSchema),
    defaultValues: createProjectDefaultValues,
    context: {
      projectType,
    },
  });

  const { watch } = methods;

  //

  const isProduct = projectType == "product";
  const isService = projectType == "service";
  const isDesign = projectType == "design";

  const titles: Record<ProjectType, string> = {
    service: t("Create a new service"),
    product: t("Create a new product"),
    design: t("Create a new design"),
  };

  //

  return (
    <FormProvider {...methods}>
      <div className="fixed right-0 top-0 p-3 bg-white w-[500px]">
        <pre>{JSON.stringify(watch(), null, 2)}</pre>
        <pre>{JSON.stringify(watch("images"), null, 2)}</pre>
      </div>
      <form>
        <Stack vertical spacing="extraLoose">
          <PTitleSubtitle title={titles[projectType]} subtitle={t("Make sure you read the Community Guidelines.")} />

          {isDesign && <PDivider />}
          {isDesign && <ImportDesignStep />}

          <PDivider />
          <MainStep />

          {isProduct && <PDivider />}
          {isProduct && <LinkDesignStep />}

          <PDivider />
          {isDesign && <LicenseStep />}
          {isService && <LocationStep projectType="service" />}
          {isProduct && <LocationStep projectType="product" />}

          <PDivider />
          <ImagesStep />

          {isProduct && <PDivider />}
          {isProduct && <DeclarationsStep />}

          <PDivider />
          <ContributorsStep />

          <PDivider />
          <RelationsStep />
        </Stack>
      </form>
    </FormProvider>
  );
}
