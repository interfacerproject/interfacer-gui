import classNames from "classnames";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import EntityTypeIcon from "./EntityTypeIcon";
import LinkWrapper from "./LinkWrapper";
import { ProjectTypeRenderProps } from "./ProjectTypeRenderProps";
import { ProjectType } from "./types";

//

interface Props {
  project?: Partial<EconomicResource>;
  projectType?: ProjectType;
  introduction?: boolean;
  link?: boolean;
}

export default function ProjectTypeChip(props: Props) {
  const { t } = useTranslation("common");
  const { project, projectType, introduction = false, link = true } = props;

  const name = (project?.conformsTo?.name as ProjectType) || projectType || ProjectType.DESIGN;
  const href = `/products?conformsTo=${project?.conformsTo?.id}`;

  const renderProps = ProjectTypeRenderProps[name];

  const hoverClasses = `hover:cursor-pointer hover:ring-2 hover:${renderProps?.classes.border}`;
  const classes = classNames(
    "flex items-center space-x-1 py-1 px-2 rounded w-fit",
    `${renderProps?.classes.bg} ${renderProps?.classes.content}`,
    {
      [hoverClasses]: link,
    }
  );

  const baseChip = (
    <span className={classes}>
      <strong>{renderProps?.label}</strong>
      <EntityTypeIcon type={name} size="default" fill="currentColor" />
    </span>
  );

  const chipWithLink = !link ? (
    baseChip
  ) : (
    <LinkWrapper href={href} openInNewTab>
      {baseChip}
    </LinkWrapper>
  );

  if (!introduction) return chipWithLink;
  else
    return (
      <div className="flex items-baseline space-x-2">
        <p>{t("This is a")}</p>
        {chipWithLink}
      </div>
    );
}
