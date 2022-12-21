import devLog from "../lib/devLog";
import { useEffect, useState } from "react";
import Link from "next/link";
import MdParser from "../lib/MdParser";
import { useTranslation } from "next-i18next";
import ResourceDetailsCard from "../components/ResourceDetailsCard";

const Dpp = ({ dpp }: { dpp: JSON }) => {
  const [relations, setRelations] = useState<any[]>([]);
  const { t } = useTranslation("lastUpdatedProps");
  const findProject = (level: any) => {
    if (level?.type === "Process") {
      const _projects = level?.children?.map((child: any) => {
        if (child.children.length === 0) return { ...child.node, user: child.node.provider_id };
        else
          return {
            name: child?.children[0]?.node.name,
            id: child?.children[0]?.node.id,
            description: child?.children[0]?.node.note,
          };
      });
      setRelations(relations.concat(_projects));
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
    <div className="w-full mt-2">
      <div className="font-bold text-xl mb-2">{t("Included or cited projects")}</div>
      {relations.map(project =>
        project.name ? (
          <div key={project.id} className="flex flex-column mt-2 border-b-2">
            <Link href={`/project/${project.id}`}>
              <a>
                <ResourceDetailsCard resource={project} />
              </a>
            </Link>
          </div>
        ) : (
          <p key={project.id}>{project.user}</p>
        )
      )}
    </div>
  );
};

export default Dpp;
