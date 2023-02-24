import { getSectionsByProjectType } from "components/partials/project/projectSections";
import TableOfContents from "components/TableOfContents";
import { ProjectType } from "components/types";
import { useTranslation } from "next-i18next";

export interface Props {
  projectType: ProjectType;
}

export default function CreateProjectNav(props: Props) {
  const { t } = useTranslation();
  const { projectType } = props;

  const links = getSectionsByProjectType(projectType).map(section => {
    const required = section.required?.includes(projectType);

    return {
      label: <span className={required ? "Polaris-Label__RequiredIndicator" : ""}>{section.navLabel}</span>,
      href: `#${section.id}`,
    };
  });

  return <TableOfContents title={t("Sections")} links={links} />;
}
