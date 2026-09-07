import { useProject } from "components/layout/FetchProjectLayout";
import { FormNavRail } from "components/partials/create/FormShell";
import { ProjectType } from "components/types";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { getSectionsByProjectType } from "../projectSections";

export default function EditProjectNav() {
  const { t } = useTranslation("common");
  const { asPath } = useRouter();
  const { project } = useProject();
  const id = project.id;

  const sections = getSectionsByProjectType(project.conformsTo?.name as ProjectType);

  const items = sections
    .filter(s => s.editPage)
    .map(s => ({
      id: `/project/${id}/${s.editPage}`,
      href: `/project/${id}/${s.editPage}`,
      label: s.navLabel,
    }));

  const activeId = items.find(item => item.href === asPath)?.id;

  return <FormNavRail items={items} activeId={activeId} ariaLabel={t("Edit project")} />;
}
