import TableOfContents from "components/TableOfContents";
import { useTranslation } from "next-i18next";
import { ProjectType } from "../CreateProjectForm";
import { getSectionByProjectType } from "./CreateProjectFields";

export interface Props {
  projectType: ProjectType;
}

export default function CreateProjectNav(props: Props) {
  const { t } = useTranslation("createProjectProps");
  const { projectType } = props;

  const links = getSectionByProjectType(projectType).map(section => {
    const required = section.required?.includes(projectType);

    return {
      label: <span className={required ? "Polaris-Label__RequiredIndicator" : ""}>{section.navLabel}</span>,
      href: `#${section.id}`,
    };
  });

  return <TableOfContents title={t("Sections")} links={links} />;
}
