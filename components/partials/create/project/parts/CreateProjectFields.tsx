import { ProjectType } from "components/types";
import { useTranslation } from "next-i18next";
import { CreateProjectValues } from "../CreateProjectForm";

// Steps
import { getSectionsByProjectType } from "components/partials/project/projectSections";
import { FormHeading, FormSection, formAccents } from "../../FormShell";

//

export interface Props {
  projectType: ProjectType;
  onSubmit?: (values: CreateProjectValues) => void;
}

//

type TFunc = (key: string) => string;

function getTitles(t: TFunc): Record<ProjectType, { title: string; subtitle: string }> {
  return {
    [ProjectType.SERVICE]: {
      title: t("Add a service"),
      subtitle: t(
        "List any open source hardware services that you offer, such as consultancy, training courses, or usage/rental of equipment. By listing your services, you can connect with others who may be interested in collaborating with you. You can also include any relevant links or resources."
      ),
    },
    [ProjectType.PRODUCT]: {
      title: t("Add a product"),
      subtitle: t(
        "Our platform is designed to support locally distributed products, so you can specify the location where your product is available. This allows others in your area to easily find and purchase your product, while also supporting local businesses and communities."
      ),
    },
    [ProjectType.DESIGN]: {
      title: t("Add a new project to Interfacer"),
      subtitle: t(
        "Add all the info needed about your project. Add purchase information (if available), and specify the location where your product is available. Create a Digital Product Passport for your product."
      ),
    },
    [ProjectType.MACHINE]: {
      title: t("Add a machine"),
      subtitle: t(
        "Share details about fabrication equipment, 3D printers, laser cutters, CNC machines, and other tools available in your maker space or lab. Help others discover the machines they need for their projects."
      ),
    },
    [ProjectType.DPP]: {
      title: t("Add a DPP"),
      subtitle: t(
        "Create a Digital Product Passport to document the lifecycle, materials, and sustainability information of your product. Help consumers and regulators access transparent product data."
      ),
    },
  };
}

export default function CreateProjectFields(props: Props) {
  const { projectType } = props;
  const sections = getSectionsByProjectType(projectType);

  return (
    <>
      {sections.map((section, index) => (
        <FormSection key={index} id={section.id} accent={accentFor(projectType)}>
          {section.component}
        </FormSection>
      ))}
    </>
  );
}

/** The marker beside each section heading is tinted by what is being created. */
function accentFor(projectType: ProjectType): string {
  if (projectType === ProjectType.PRODUCT) return formAccents.product;
  if (projectType === ProjectType.SERVICE) return formAccents.service;
  if (projectType === ProjectType.DPP) return formAccents.dpp;
  return formAccents.design;
}

/** Page heading — rendered above both columns, as in the prototype. */
export function CreateProjectHeader(props: { projectType: ProjectType }) {
  const { t } = useTranslation("createProjectProps");
  const { title, subtitle } = getTitles(t)[props.projectType];

  return <FormHeading title={title} subtitle={subtitle} />;
}
