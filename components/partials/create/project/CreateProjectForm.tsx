import { useTranslation } from "next-i18next";

// Steps
import ContributorsStep, { Values as ContributorsStepValues } from "./ContributorsStep";
import DeclarationsStep, { Values as DeclarationsStepValues } from "./DeclarationsStep";
import ImagesStep, { Values as ImagesStepValues } from "./ImagesStep";
import ImportDesignStep, { ImportedData } from "./ImportDesignStep";
import LicenseStep from "./LicenseStep";
import LinkDesignStep, { Values as LinkDesignValues } from "./LinkDesignStep";
import LocationStep, { Values as LocationStepValues } from "./LocationStep";
import MainStep, { Values as MainStepValues } from "./MainStep";
import RelationsStep, { Values as RelationsStepValues } from "./RelationsStep";

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
  main: MainStepValues | null;
  linkedDesign: LinkDesignValues;
  location: LocationStepValues | null;
  images: ImagesStepValues;
  declarations: DeclarationsStepValues | null;
  contributors: ContributorsStepValues;
  relations: RelationsStepValues;
}

//

export default function CreateProjectForm(props: Props) {
  const { t } = useTranslation();
  const { projectType } = props;

  function handleImport(data: ImportedData) {
    console.log(data);
    // TODO: set values
  }

  function handleMain(values: MainStepValues | null) {
    console.log(values);
  }
  function handleLinkDesign(values: any) {
    console.log(values);
  }
  function handleLocation(values: LocationStepValues | null) {
    console.log(values);
  }
  function handleImages(values: ImagesStepValues) {
    console.log(values);
  }
  function handleDeclarations(values: DeclarationsStepValues | null) {
    console.log(values);
  }
  function handleContributors(values: ContributorsStepValues) {
    console.log(values);
  }
  function handleRelations(values: RelationsStepValues) {
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
