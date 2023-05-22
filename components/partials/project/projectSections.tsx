import { ProjectType } from "components/types";
import { CreateProjectValues } from "../create/project/CreateProjectForm";
import ContributorsStep from "../create/project/steps/ContributorsStep";
import DeclarationsStep from "../create/project/steps/DeclarationsStep";
import ImagesStep from "../create/project/steps/ImagesStep";
import ImportDesignStep from "../create/project/steps/ImportDesignStep";
import LicenseStep from "../create/project/steps/LicenseStep";
import LinkDesignStep from "../create/project/steps/LinkDesignStep";
import LocationStep from "../create/project/steps/LocationStep";
import MainStep from "../create/project/steps/MainStep";
import RelationsStep from "../create/project/steps/RelationsStep";

//

export type ProjectSectionsIDs = keyof CreateProjectValues | "importDesign";

export type ProjectSection = {
  navLabel: string;
  id: ProjectSectionsIDs;
  component: React.ReactNode;
  for?: Array<ProjectType>;
  required?: Array<ProjectType>;
  editPage?: string;
};

export const projectSections: Array<ProjectSection> = [
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
    editPage: "edit",
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
    required: [ProjectType.PRODUCT, ProjectType.SERVICE, ProjectType.DESIGN],
    editPage: "edit/images",
  },
  {
    navLabel: "Location",
    id: "location",
    component: <LocationStep projectType={ProjectType.PRODUCT} />,
    for: [ProjectType.PRODUCT],
    required: [ProjectType.PRODUCT],
    editPage: "edit/location",
  },
  {
    navLabel: "Location",
    id: "location",
    component: <LocationStep projectType={ProjectType.SERVICE} />,
    for: [ProjectType.SERVICE],
    editPage: "edit/location",
  },
  {
    navLabel: "Certifications",
    id: "declarations",
    component: <DeclarationsStep />,
    for: [ProjectType.PRODUCT],
    required: [ProjectType.PRODUCT],
    editPage: "edit/declarations",
  },
  {
    navLabel: "Licenses",
    id: "licenses",
    component: <LicenseStep />,
    for: [ProjectType.DESIGN],
    editPage: "edit/licenses",
  },
  {
    navLabel: "Contributors",
    id: "contributors",
    component: <ContributorsStep />,
    editPage: "edit/contributors",
  },
  {
    navLabel: "Relations",
    id: "relations",
    component: <RelationsStep />,
    editPage: "edit/relations",
  },
];

//

export function getSectionsByProjectType(projectType: ProjectType): Array<ProjectSection> {
  return projectSections.filter(section => !section.for || section.for.includes(projectType));
}

export function getEditSectionsByProjectType(projectType: ProjectType): Array<ProjectSection> {
  return getSectionsByProjectType(projectType).filter(section => section.editPage);
}

export function isEditRouteAllowed(projectType: ProjectType, editRoute: string): boolean {
  return getEditSectionsByProjectType(projectType).some(section => section.editPage === editRoute);
}
