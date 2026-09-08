import { ProjectType } from "components/types";
import { CreateProjectValues } from "../create/project/CreateProjectForm";
import ContributorsStep from "../create/project/steps/ContributorsStep";
import DeclarationsStep from "../create/project/steps/DeclarationsStep";
import ImagesStep from "../create/project/steps/ImagesStep";
import ImportDesignStep from "../create/project/steps/ImportDesignStep";
import LicenseStep from "../create/project/steps/LicenseStep";
import LinkDesignStep from "../create/project/steps/LinkDesignStep";
import LocationStep from "../create/project/steps/LocationStep";
import MachinesStep from "../create/project/steps/MachinesStep";
import MainStep from "../create/project/steps/MainStep";
import MaterialsStep from "../create/project/steps/MaterialsStep";
import ModelFilesStep from "../create/project/steps/ModelFilesStep";
import PowerRequirementsStep from "../create/project/steps/PowerRequirementsStep";
import ProductFiltersStep from "../create/project/steps/ProductFiltersStep";
import RelationsStep from "../create/project/steps/RelationsStep";
import ServiceFiltersStep from "../create/project/steps/ServiceFiltersStep";

//

export type ProjectSectionsIDs = keyof CreateProjectValues | "importDesign" | "included";

export type ProjectSection = {
  navLabel: string;
  navLabelByType?: Partial<Record<ProjectType, string>>;
  id: ProjectSectionsIDs;
  component: React.ReactNode;
  for?: Array<ProjectType>;
  required?: Array<ProjectType>;
  editPage?: string;
  /** Section index used to order nav + rendered sections per project type. */
  orderByType?: Partial<Record<ProjectType, number>>;
  /** Hide the nav entry for a project type (section still renders). */
  hideInNavByType?: Partial<Record<ProjectType, boolean>>;
};

export const projectSections: Array<ProjectSection> = [
  {
    navLabel: "Import design",
    navLabelByType: { [ProjectType.DESIGN]: "Repository info" },
    id: "importDesign",
    component: <ImportDesignStep />,
    for: [ProjectType.DESIGN],
    required: [ProjectType.DESIGN],
    orderByType: { [ProjectType.DESIGN]: 10 },
  },
  {
    navLabel: "General info",
    id: "main",
    component: <MainStep />,
    required: [ProjectType.PRODUCT, ProjectType.SERVICE, ProjectType.DESIGN, ProjectType.MACHINE],
    editPage: "edit",
    orderByType: { [ProjectType.DESIGN]: 20 },
    hideInNavByType: { [ProjectType.DESIGN]: true },
  },
  {
    navLabel: "Design source",
    id: "linkedDesign",
    component: <LinkDesignStep />,
    required: [ProjectType.PRODUCT],
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
    orderByType: { [ProjectType.DESIGN]: 30 },
    hideInNavByType: { [ProjectType.DESIGN]: true },
  },
  {
    navLabel: "3D files",
    navLabelByType: { [ProjectType.DESIGN]: "CAD & 3D files" },
    id: "modelFiles",
    component: <ModelFilesStep />,
    for: [ProjectType.DESIGN],
    editPage: "edit/model",
    orderByType: { [ProjectType.DESIGN]: 60 },
  },
  {
    navLabel: "Service details",
    id: "serviceFilters",
    component: <ServiceFiltersStep />,
    for: [ProjectType.SERVICE],
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
    navLabelByType: { [ProjectType.DESIGN]: "License info" },
    id: "licenses",
    component: <LicenseStep />,
    for: [ProjectType.DESIGN],
    editPage: "edit/licenses",
    orderByType: { [ProjectType.DESIGN]: 40 },
  },
  {
    navLabel: "Contributors",
    navLabelByType: { [ProjectType.DESIGN]: "Contributors and included projects" },
    id: "contributors",
    component: <ContributorsStep />,
    for: [ProjectType.DESIGN, ProjectType.PRODUCT, ProjectType.SERVICE, ProjectType.MACHINE],
    editPage: "edit/contributors",
    orderByType: { [ProjectType.DESIGN]: 90 },
  },
  {
    navLabel: "Included",
    id: "included",
    component: <RelationsStep />,
    for: [ProjectType.DESIGN, ProjectType.PRODUCT, ProjectType.SERVICE, ProjectType.MACHINE],
    editPage: "edit/relations",
    orderByType: { [ProjectType.DESIGN]: 100 },
    hideInNavByType: { [ProjectType.DESIGN]: true },
  },
  {
    navLabel: "Machines",
    navLabelByType: { [ProjectType.DESIGN]: "Required tools and machine code" },
    id: "machines",
    component: <MachinesStep />,
    for: [ProjectType.PRODUCT, ProjectType.DESIGN],
    editPage: "edit/machines",
    orderByType: { [ProjectType.DESIGN]: 70 },
  },
  {
    navLabel: "Materials",
    navLabelByType: { [ProjectType.DESIGN]: "Materials needed" },
    id: "materials",
    component: <MaterialsStep />,
    for: [ProjectType.PRODUCT, ProjectType.DESIGN],
    orderByType: { [ProjectType.DESIGN]: 50 },
  },
  {
    navLabel: "Power requirements",
    id: "power",
    component: <PowerRequirementsStep />,
    for: [ProjectType.DESIGN],
    orderByType: { [ProjectType.DESIGN]: 80 },
  },
];

//

export function getSectionsByProjectType(projectType: ProjectType): Array<ProjectSection> {
  return projectSections
    .filter(section => !section.for || section.for.includes(projectType))
    .sort((a, b) => {
      const oa = a.orderByType?.[projectType] ?? Number.MAX_SAFE_INTEGER;
      const ob = b.orderByType?.[projectType] ?? Number.MAX_SAFE_INTEGER;
      if (oa !== ob) return oa - ob;
      // Stable fallback to declaration order
      return projectSections.indexOf(a) - projectSections.indexOf(b);
    });
}

export function getEditSectionsByProjectType(projectType: ProjectType): Array<ProjectSection> {
  return getSectionsByProjectType(projectType).filter(section => section.editPage);
}

export function isEditRouteAllowed(projectType: ProjectType, editRoute: string): boolean {
  return getEditSectionsByProjectType(projectType).some(section => section.editPage === editRoute);
}
