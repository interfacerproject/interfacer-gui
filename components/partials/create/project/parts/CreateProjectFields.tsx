import { ProjectType } from "components/types";
import { useTranslation } from "next-i18next";
import React from "react";
import { CreateProjectValues } from "../CreateProjectForm";

// Steps
import ContributorsStep from "../steps/ContributorsStep";
import DeclarationsStep from "../steps/DeclarationsStep";
import ImagesStep from "../steps/ImagesStep";
import ImportDesignStep from "../steps/ImportDesignStep";
import LicenseStep from "../steps/LicenseStep";
import LinkDesignStep from "../steps/LinkDesignStep";
import LocationStep from "../steps/LocationStep";
import MainStep from "../steps/MainStep";
import RelationsStep from "../steps/RelationsStep";

// Components
import { Stack } from "@bbtgnn/polaris-interfacer";
import PDivider from "components/polaris/PDivider";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";

//

export interface Props {
  projectType: ProjectType;
  onSubmit?: (values: CreateProjectValues) => void;
}

//

export type FormSectionsIDs = keyof CreateProjectValues | "importDesign";

export type FormSection = {
  navLabel: string;
  id: FormSectionsIDs;
  component: React.ReactNode;
  for?: Array<ProjectType>;
  required?: Array<ProjectType>;
};

export const formSections: Array<FormSection> = [
  {
    navLabel: "Import design",
    id: "importDesign",
    component: <ImportDesignStep />,
    for: [ProjectType.DESIGN],
  },
  {
    navLabel: "General info",
    id: "main",
    component: <MainStep />,
    required: [ProjectType.PRODUCT, ProjectType.SERVICE, ProjectType.DESIGN],
  },
  {
    navLabel: "Design source",
    id: "linkedDesign",
    component: <LinkDesignStep />,
    for: [ProjectType.PRODUCT],
  },
  {
    navLabel: "Images",
    id: "images",
    component: <ImagesStep />,
  },
  {
    navLabel: "Location",
    id: "location",
    component: <LocationStep projectType={ProjectType.PRODUCT} />,
    for: [ProjectType.PRODUCT],
    required: [ProjectType.PRODUCT],
  },
  {
    navLabel: "Location",
    id: "location",
    component: <LocationStep projectType={ProjectType.SERVICE} />,
    for: [ProjectType.SERVICE],
  },
  {
    navLabel: "Certifications",
    id: "declarations",
    component: <DeclarationsStep />,
    for: [ProjectType.PRODUCT],
    required: [ProjectType.PRODUCT],
  },
  {
    navLabel: "Licenses",
    id: "licenses",
    component: <LicenseStep />,
    for: [ProjectType.DESIGN],
  },
  {
    navLabel: "Contributors",
    id: "contributors",
    component: <ContributorsStep />,
  },
  {
    navLabel: "Relations",
    id: "relations",
    component: <RelationsStep />,
  },
];

export function getSectionByProjectType(projectType: ProjectType): Array<FormSection> {
  return formSections.filter(section => !section.for || section.for.includes(projectType));
}

//

export default function CreateProjectFields(props: Props) {
  const { t } = useTranslation();
  const { projectType } = props;

  const titles: Record<ProjectType, string> = {
    [ProjectType.SERVICE]: t("Create a new service"),
    [ProjectType.PRODUCT]: t("Create a new product"),
    [ProjectType.DESIGN]: t("Create a new design"),
  };

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle title={titles[projectType]} subtitle={t("Make sure you read the Community Guidelines.")} />

      {formSections.map((section, index) => {
        if (!section.for || section.for.includes(projectType)) {
          return (
            <Stack vertical key={index} spacing="extraLoose">
              <PDivider id={section.id} />
              {section.component}
            </Stack>
          );
        }
      })}
    </Stack>
  );
}
