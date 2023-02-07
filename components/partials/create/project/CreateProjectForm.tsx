import { useTranslation } from "next-i18next";

// Steps
import ContributorsStep, { ContributorsStepData } from "./ContributorsStep";
import DeclarationsStep, { DeclarationsStepData } from "./DeclarationsStep";
import ImagesStep, { ImagesStepData } from "./ImagesStep";
import ImportDesignStep, { ImportDesignStepData } from "./ImportDesignStep";
import LicenseStep from "./LicenseStep";
import LinkDesignStep, { LinkDesignStepData } from "./LinkDesignStep";
import LocationStep, { LocationStepData } from "./LocationStep";
import MainStep, { MainStepData } from "./MainStep";
import RelationsStep, { RelationsStepData } from "./RelationsStep";

// Components
import PDivider from "components/polaris/PDivider";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";

// Layout
import { Stack } from "@bbtgnn/polaris-interfacer";

//

export type ProjectType = "service" | "product" | "design";

export interface Props {
  projectType: ProjectType;
}

export interface ProjectData {
  main: MainStepData;
  linkedDesign: LinkDesignStepData;
  location: LocationStepData;
  images: ImagesStepData;
  declarations: DeclarationsStepData;
  contributors: ContributorsStepData;
  relations: RelationsStepData;
}

//

export default function CreateProjectForm(props: Props) {
  const { t } = useTranslation();
  const { projectType } = props;

  function handleImport(data: ImportDesignStepData) {
    console.log(data);
    // TODO: set values
  }

  function handleMain(values: MainStepData) {
    console.log(values);
  }
  function handleLinkDesign(values: LinkDesignStepData) {
    console.log(values);
  }
  function handleLocation(values: LocationStepData) {
    console.log(values);
  }
  function handleImages(values: ImagesStepData) {
    console.log(values);
  }
  function handleDeclarations(values: DeclarationsStepData) {
    console.log(values);
  }
  function handleContributors(values: ContributorsStepData) {
    console.log(values);
  }
  function handleRelations(values: RelationsStepData) {
    console.log(values);
  }

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
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle title={titles[projectType]} subtitle={t("Make sure you read the Community Guidelines.")} />

      {isDesign && <PDivider />}
      {isDesign && <ImportDesignStep onImport={handleImport} />}

      <PDivider />
      <MainStep onValid={handleMain} />

      {isProduct && <PDivider />}
      {isProduct && <LinkDesignStep onChange={handleLinkDesign} />}

      <PDivider />
      {isDesign && <LicenseStep />}
      {isService && <LocationStep projectType="service" onValid={handleLocation} />}
      {isProduct && <LocationStep projectType="product" onValid={handleLocation} />}

      <PDivider />
      <ImagesStep onUpdate={handleImages} />

      {isProduct && <PDivider />}
      {isProduct && <DeclarationsStep onValid={handleDeclarations} />}

      <PDivider />
      <ContributorsStep onUpdate={handleContributors} />

      <PDivider />
      <RelationsStep onUpdate={handleRelations} />
    </Stack>
  );
}
