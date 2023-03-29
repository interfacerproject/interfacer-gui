import { Collaborate, DataDefinition, GroupObjectsNew } from "@carbon/icons-react";
import classNames from "classnames";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import { ReactNode } from "react";
import LinkWrapper from "./LinkWrapper";
import { ProjectTypeRenderProps } from "./ProjectTypeRenderProps";
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

  const renderProps = ProjectTypeRenderProps[name];

  const hoverClasses = `hover:cursor-pointer hover:ring-2 hover:${renderProps.classes.border}`;
  const classes = classNames(
    "flex items-center space-x-1 py-1 px-2 rounded w-fit",
    `${renderProps.classes.bg} ${renderProps.classes.content}`,
    {
      [hoverClasses]: link,
    }
  );

  const baseChip = (
    <span className={classes}>
      <strong>{renderProps.label}</strong>
      <renderProps.icon size={16} />
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
