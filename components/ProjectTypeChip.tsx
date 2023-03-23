import { Collaborate, DataDefinition, GroupObjectsNew } from "@carbon/icons-react";
import classNames from "classnames";
import { isProjectType } from "lib/isProjectType";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import { ReactNode } from "react";
import LinkWrapper from "./LinkWrapper";
import { ProjectType } from "./types";

//

const icons: Record<ProjectType, ReactNode> = {
  Design: <GroupObjectsNew />,
  Product: <DataDefinition />,
  Service: <Collaborate />,
};

interface Props {
  project?: Partial<EconomicResource>;
  introduction?: boolean;
  link?: boolean;
}

export default function ProjectTypeChip(props: Props) {
  const { t } = useTranslation("common");
  const { project, introduction = false, link = true } = props;

  const name = project?.conformsTo?.name as ProjectType;
  const href = `/projects?conformsTo=${project?.conformsTo?.id}`;

  const isType = isProjectType(name);

  const classes = classNames("flex items-center space-x-1 py-1 px-2 rounded w-fit", {
    "hover:ring-2 hover:cursor-pointer": link,
    "bg-[#E4CCE3] text-[#413840]": isType.Design,
    "hover:ring-[#C18ABF]": isType.Design && link,
    "bg-[#FAE5B7] text-[#614C1F]": isType.Product,
    "hover:ring-[#614C1F]": isType.Product && link,
    "bg-[#CDE0E4] text-[#024960] ": isType.Service,
    "hover:ring-[#5D8CA0]": isType.Service && link,
  });

  const baseChip = (
    <span className={classes}>
      <strong>{name}</strong>
      {icons[name]}
    </span>
  );

  const chipWithLink = !link ? baseChip : <LinkWrapper href={href}>{baseChip}</LinkWrapper>;

  if (!introduction) return chipWithLink;
  else
    return (
      <div className="flex items-baseline space-x-2">
        <p>{t("This is a")}</p>
        {chipWithLink}
      </div>
    );
}
