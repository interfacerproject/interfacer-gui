import { FormSectionContext } from "components/polaris/PTitleSubtitle";
import { ProjectType } from "components/types";
import { useTranslation } from "next-i18next";
import { CreateProjectValues } from "../CreateProjectForm";

// Steps
import { getSectionsByProjectType } from "components/partials/project/projectSections";

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
    <div className="flex flex-col gap-6">
      {/* Section cards */}
      {sections.map((section, index) => (
        <section
          key={index}
          id={section.id}
          className="bg-ifr-surface border border-ifr scroll-mt-6"
          style={{ borderRadius: "var(--ifr-radius-lg)" }}
        >
          <div className="flex flex-col gap-10 items-start py-6 px-4 md:py-8 md:px-[33px]">
            <FormSectionContext.Provider value={true}>{section.component}</FormSectionContext.Provider>
          </div>
        </section>
      ))}
    </div>
  );
}

/** Page heading — rendered above both columns, as in the prototype. */
export function CreateProjectHeader(props: { projectType: ProjectType }) {
  const { t } = useTranslation("createProjectProps");
  const { title, subtitle } = getTitles(t)[props.projectType];

  return (
    <div className="mb-6">
      <h1
        className="text-ifr-text-primary m-0"
        style={{
          fontFamily: "var(--ifr-font-heading)",
          fontSize: "var(--ifr-fs-xl)",
          fontWeight: "var(--ifr-fw-bold)",
          lineHeight: "36px",
        }}
      >
        {title}
      </h1>
      <p
        className="text-ifr-text-secondary m-0 mt-2 max-w-[791px]"
        style={{
          fontFamily: "var(--ifr-font-body)",
          fontSize: "var(--ifr-fs-base)",
          fontWeight: "var(--ifr-fw-regular)",
          lineHeight: "21px",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}
