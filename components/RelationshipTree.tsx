import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import ResourceDetailsCard from "../components/ResourceDetailsCard";

const RelationshipTree = ({ dpp }: { dpp: JSON }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const { t } = useTranslation("lastUpdatedProps");
  const findProject = (level: any) => {
    if (!!level?.children[0]?.children[0]?.node?.accounting_quantity_has_numerical_value) {
      const _projects = level?.children?.map((child: any) => ({
        name: child?.children[0]?.node.name,
        id: child?.children[0]?.node.id,
        description: child?.children[0]?.node.note,
      }));
      setProjects(projects.concat(_projects));
    } else {
      for (let i = 0; i < level?.children?.length; i++) {
        findProject(level.children[i]);
      }
    }
  };
  useEffect(() => {
    findProject(dpp);
  }, [dpp]);
  return (
    <div className="w-full mt-2" id="relationshipTree">
      <div className="font-bold text-xl mb-2">{t("Included or cited projects")}</div>
      {projects.map(project => (
        <div key={project.id} className="flex flex-column mt-2 border-b-2">
          <Link href={`/project/${project.id}`}>
            <a>
              <ResourceDetailsCard resource={project} />
            </a>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default RelationshipTree;
