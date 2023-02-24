import { ProjectType } from "components/types";
import { useTranslation } from "next-i18next";
import { CreateProjectValues } from "../CreateProjectForm";

// Steps
import { getSectionsByProjectType } from "components/partials/project/projectSections";

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

export default function CreateProjectFields(props: Props) {
  const { t } = useTranslation();
  const { projectType } = props;

  const titles: Record<ProjectType, string> = {
    [ProjectType.SERVICE]: t("Create a new service"),
    [ProjectType.PRODUCT]: t("Create a new product"),
    [ProjectType.DESIGN]: t("Create a new design"),
  };

  const sections = getSectionsByProjectType(projectType);

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle title={titles[projectType]} subtitle={t("Make sure you read the Community Guidelines.")} />

      {sections.map((section, index) => (
        <Stack vertical key={index} spacing="extraLoose">
          <PDivider id={section.id} />
          {section.component}
        </Stack>
      ))}
    </Stack>
  );
}
