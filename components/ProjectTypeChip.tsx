import { Collaborate, DataDefinition, GroupObjectsNew } from "@carbon/icons-react";
import classNames from "classnames";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

const icons: any = {
  Design: <GroupObjectsNew />,
  Product: <DataDefinition />,
  Service: <Collaborate />,
};

const ProjectTypeChip = (props: { projectNode?: Partial<EconomicResource>; noIntroduction?: boolean }) => {
  const name = props.projectNode?.conformsTo?.name || "Design";
  const { t } = useTranslation("common");

  const router = useRouter();
  const handleCoformstoClick = () => {
    router.push(`/projects?conformsTo=${props.projectNode?.conformsTo?.id}`);
  };

  return (
    <button className="flex items-center space-x-1" onClick={handleCoformstoClick}>
      {!props.noIntroduction && <p>{t("This is a")}</p>}
      <span
        className={classNames("flex space-x-1 py-0.5 px-1 rounded items-center hover:cursor-pointer", {
          "bg-[#E4CCE3] text-[#413840] border-[#C18ABF]": name === "Design",
          "bg-[#FAE5B7] text-[#614C1F] border-[#614C1F]": name === "Product",
          "bg-[#CDE0E4] text-[#024960] border-[#5D8CA0]": name === "Service",
        })}
      >
        <strong>{name}</strong>
        {icons[name]}
      </span>
    </button>
  );
};

export default ProjectTypeChip;
