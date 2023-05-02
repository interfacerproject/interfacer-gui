import { Text } from "@bbtgnn/polaris-interfacer";
import classNames from "classnames";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useState } from "react";
import LocationText from "./LocationText";
import ProjectTypeChip from "./ProjectTypeChip";
import ProjectTypeRoundIcon from "./ProjectTypeRoundIcon";
import BrTags from "./brickroom/BrTags";
import { CreateProjectValues } from "./partials/create/project/CreateProjectForm";
import { ProjectType } from "./types";

export interface DraftCardProps {
  project: Partial<CreateProjectValues>;
  projectType: ProjectType;
  id?: number;
}

export default function DraftCard(props: DraftCardProps) {
  const { project, projectType, id } = props;
  const [hover, setHover] = useState(false);
  const setHoverTrue = () => setHover(true);
  const setHoverFalse = () => setHover(false);
  const classes = classNames("rounded-lg bg-white shadow flex flex-col justify-between", {
    "ring-2 ring-primary": hover,
  });
  const location = project.location?.locationData?.address;
  const isDesign = projectType === ProjectType.DESIGN;
  const image = project.images?.[0];
  return (
    <div className={classes}>
      <div className="space-y-3 p-3">
        <div className="flex justify-between items-center"></div>
        <div onMouseOver={setHoverTrue} onMouseLeave={setHoverFalse}>
          <Link href={`/create/project/design?draft_id=${id}`}>
            <a className="space-y-3">
              <div className="h-60 bg-base-200 rounded-lg flex items-center justify-center overflow-hidden">
                {!image && projectType && (
                  <div className="opacity-40">
                    <ProjectTypeRoundIcon projectType={projectType} />
                  </div>
                )}
                {image && <img alt={image.name} src={window.URL.createObjectURL(image)} />}
              </div>
              <div>
                <Text variant="headingLg" as="h4">
                  {project.main?.title}
                </Text>
                <StatsDisplay project={project} />
              </div>
              <div className="space-y-1">
                <ProjectTypeChip projectType={projectType} link={false} />
                {location && !isDesign && <LocationText color="primary" name={location} />}
              </div>
            </a>
          </Link>
        </div>
      </div>

      {project.main?.tags && (
        <div className="p-3 border-t-1 border-t-gray-200">
          <BrTags wrap={false} tags={project.main.tags} />
        </div>
      )}
    </div>
  );
}

/* Partials */

function StatDisplay(props: { stat: number; label: string }) {
  const { stat, label } = props;
  return (
    <>
      {Boolean(stat) && (
        <Text as="p" variant="bodyMd" color="subdued">
          <strong>{stat}</strong> {label}
        </Text>
      )}
    </>
  );
}

function StatsDisplay(props: { project: Partial<CreateProjectValues> }) {
  const { t } = useTranslation("common");
  const { project } = props;

  const contributorsNum = project.contributors?.length;
  const relationsNum = project.relations?.length;

  const stats = [
    { stat: contributorsNum || 0, label: t("contributor", { count: contributorsNum }) },
    { stat: relationsNum || 0, label: t("relation", { count: relationsNum }) },
  ];

  return (
    <div className="flex [&>*+*]:before:content-[',_']">
      {stats.map((s, i) => (
        <StatDisplay stat={s.stat} label={s.label} key={i} />
      ))}
    </div>
  );
}
