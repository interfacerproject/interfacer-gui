import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import ResourceDetailsCard from "../components/ResourceDetailsCard";

const Relations = ({ dpp }: { dpp: JSON }) => {
  const [relations, setRelations] = useState<any[]>([]);
  const { t } = useTranslation("lastUpdatedProps");

  const Line = ({ id, children, type }: { id: string; children: React.ReactNode; type: string }) => (
    <div key={id} className="flex flex-column mt-2 border-b-2">
      <Link href={`/${type}/${id}`}>
        <a>{children}</a>
      </Link>
    </div>
  );

  const findProject = (level: any) => {
    if (level?.type === "Process") {
      const _projects = level?.children?.map((child: any) =>
        child.children.length === 0 ? (
          <Line id={child.node.provider_id} key={child.node.provider_id} type="profile">
            <p>
              {"this user: "}
              {child.node.provider_id}
              {" contributes"}
            </p>
          </Line>
        ) : (
          <Line id={child?.children[0]?.node.id} key={child?.children[0]?.node.id} type="project">
            <ResourceDetailsCard resource={child?.children[0]?.node} />
          </Line>
        )
      );
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
      {relations.map(project => project)}
    </div>
  );
};

export default Relations;
