import { ProjectType } from "components/types";
import { useTranslation } from "next-i18next";
import { CreateProjectValues } from "../CreateProjectForm";

// Steps
import { getSectionsByProjectType } from "components/partials/project/projectSections";

// Components
import { Stack } from "@bbtgnn/polaris-interfacer";
import Card from "components/Card";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";

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
  };

  const sections = getSectionsByProjectType(projectType);

  //

  return (
    <Stack vertical spacing="extraLoose">
      <Card>
        <div className="p-6">
          <PTitleSubtitle title={titles[projectType].title} subtitle={titles[projectType].subtitle} />
        </div>
      </Card>

      {sections.map((section, index) => (
        <div key={index}>
          <div id={section.id} className="pb-16" />
          <Card>
            <div className="p-6">
              <Stack vertical spacing="extraLoose">
                {section.component}
              </Stack>
            </div>
          </Card>
        </div>
      ))}
    </Stack>
  );
}
