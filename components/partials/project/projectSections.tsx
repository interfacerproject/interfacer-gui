import { ProjectType } from "components/types";
import { CreateProjectValues } from "../create/project/CreateProjectForm";
import ContributorsStep from "../create/project/steps/ContributorsStep";
import DeclarationsStep from "../create/project/steps/DeclarationsStep";
import DPPStep from "../create/project/steps/DPPStep";
import ImagesStep from "../create/project/steps/ImagesStep";
import ImportDesignStep from "../create/project/steps/ImportDesignStep";
import LicenseStep from "../create/project/steps/LicenseStep";
import LinkDesignStep from "../create/project/steps/LinkDesignStep";
import LocationStep from "../create/project/steps/LocationStep";
import MachinesStep from "../create/project/steps/MachinesStep";
import MainStep from "../create/project/steps/MainStep";
import MaterialsStep from "../create/project/steps/MaterialsStep";
import ProductFiltersStep from "../create/project/steps/ProductFiltersStep";
import RelationsStep from "../create/project/steps/RelationsStep";

//

export type ProjectSectionsIDs = keyof CreateProjectValues | "importDesign" | "included";

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
    required: [ProjectType.PRODUCT, ProjectType.SERVICE, ProjectType.DESIGN, ProjectType.MACHINE],
    editPage: "edit",
  },
  {
    navLabel: "Design source",
    id: "linkedDesign",
    component: <LinkDesignStep />,
    for: [ProjectType.PRODUCT],
  },
  {
    navLabel: "Specifications",
    id: "productFilters",
    component: <ProductFiltersStep />,
    for: [ProjectType.PRODUCT],
    editPage: "edit/specs",
  },
  {
    navLabel: "Images",
    id: "images",
    component: <ImagesStep />,
    required: [ProjectType.PRODUCT, ProjectType.SERVICE, ProjectType.DESIGN, ProjectType.MACHINE],
    editPage: "edit/images",
  },
  {
    navLabel: "Location",
    id: "location",
    component: <LocationStep projectType={ProjectType.PRODUCT} />,
    for: [ProjectType.PRODUCT],
    // required: [ProjectType.PRODUCT],
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
    navLabel: "Location",
    id: "location",
    component: <LocationStep projectType={ProjectType.MACHINE} />,
    for: [ProjectType.MACHINE],
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
    for: [ProjectType.DESIGN, ProjectType.PRODUCT, ProjectType.SERVICE, ProjectType.MACHINE],
    editPage: "edit/contributors",
  },
  {
    navLabel: "Included",
    id: "included",
    component: <RelationsStep />,
    for: [ProjectType.DESIGN, ProjectType.PRODUCT, ProjectType.SERVICE, ProjectType.MACHINE],
    editPage: "edit/relations",
  },
  {
    navLabel: "DPP",
    id: "dpp",
    component: <DPPStep />,
    for: [ProjectType.PRODUCT],
  },
  {
    navLabel: "Machines",
    id: "machines",
    component: <MachinesStep />,
    for: [ProjectType.PRODUCT],
    editPage: "edit/machines",
  },
  {
    navLabel: "Materials",
    id: "materials",
    component: <MaterialsStep />,
    for: [ProjectType.PRODUCT],
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
