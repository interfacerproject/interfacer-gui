import { useProject } from "components/layout/FetchProjectLayout";
import TableOfContents, { TOCLink } from "components/TableOfContents";
import { ProjectType } from "components/types";
import { useRouter } from "next/router";
import { getSectionsByProjectType } from "../projectSections";

export default function EditProjectNav() {
  const { asPath } = useRouter();
  const { project } = useProject();
  const id = project.id;

  function isCurrent(link: TOCLink) {
    return link.href === asPath;
  }

  const sections = getSectionsByProjectType(project.conformsTo?.name as ProjectType);
  const links: Array<TOCLink> = [];
  sections.forEach(s => {
    if (s.editPage)
      links.push({
        label: s.navLabel,
        href: `/project/${id}/${s.editPage}`,
      });
  });

  return <TableOfContents title="Edit project" links={links} isCurrent={isCurrent} />;
}
