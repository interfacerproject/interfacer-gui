import { getSectionsByProjectType } from "components/partials/project/projectSections";
import { ProjectType } from "components/types";
import { useTranslation } from "next-i18next";
import { useMemo } from "react";
import { FormNavRail, useSectionScrollSpy } from "../../FormShell";

export interface Props {
  projectType: ProjectType;
}

export default function CreateProjectNav(props: Props) {
  const { t } = useTranslation("createProjectProps");
  const { projectType } = props;

  const sections = getSectionsByProjectType(projectType);

  const items = useMemo(
    () =>
      sections
        .filter(section => !section.hideInNavByType?.[projectType])
        .map(section => ({
          id: section.id,
          label: section.navLabelByType?.[projectType] || section.navLabel,
          required: section.required?.includes(projectType),
        })),
    [sections, projectType]
  );

  const { activeId, scrollTo } = useSectionScrollSpy(sections.map(s => s.id));

  return <FormNavRail items={items} activeId={activeId} onSelect={scrollTo} ariaLabel={t("Sections")} />;
}
