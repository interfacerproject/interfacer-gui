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

export default function CreateProjectFields(props: Props) {
  const { t } = useTranslation("createProjectProps");
  const { projectType } = props;

  const titles: Record<ProjectType, { title: string; subtitle: string }> = {
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
      title: t("Add a design"),
      subtitle: t(
        "Import your project repository. Share your open source hardware project documentation and collaborate on building it. Your contribution will help others learn and build upon your work."
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

  const sections = getSectionsByProjectType(projectType);

  //

  return (
    <div className="flex flex-col gap-6">
      {/* Header card */}
      <div className="bg-ifr-surface border border-ifr rounded-ifr-md py-8 px-8">
        <h1
          className="text-ifr-text-primary m-0 mb-2"
          style={{
            fontFamily: "var(--ifr-font-heading)",
            fontSize: "var(--ifr-fs-2xl)",
            fontWeight: "var(--ifr-fw-bold)",
            lineHeight: "1.2",
          }}
        >
          {titles[projectType].title}
        </h1>
        <p
          className="text-ifr-text-secondary m-0"
          style={{
            fontFamily: "var(--ifr-font-body)",
            fontSize: "var(--ifr-fs-md)",
            lineHeight: "1.6",
          }}
        >
          {titles[projectType].subtitle}
        </p>
      </div>

      {/* Section cards */}
      {sections.map((section, index) => (
        <div key={index}>
          <div id={section.id} className="scroll-mt-24" />
          <div className="bg-ifr-surface border border-ifr rounded-ifr-md py-8 px-8">
            <div className="flex flex-col gap-6">{section.component}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
