import { Text } from "@bbtgnn/polaris-interfacer";
import classNames from "classnames";
import { useAuth } from "hooks/useAuth";
import { isProjectType } from "lib/isProjectType";
import { Agent, EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useState } from "react";
import AddStar from "./AddStar";
import LocationText from "./LocationText";
import ProjectCardImage from "./ProjectCardImage";
import ProjectTypeChip from "./ProjectTypeChip";
import BrTags from "./brickroom/BrTags";
import BrUserAvatar from "./brickroom/BrUserAvatar";
import { ProjectType } from "./types";

export interface ProjectCardProps {
  project: Partial<EconomicResource>;
}

export default function ProjectCard(props: ProjectCardProps) {
  const { project } = props;
  const { user } = useAuth();

  const [hover, setHover] = useState(false);
  const setHoverTrue = () => setHover(true);
  const setHoverFalse = () => setHover(false);

  const classes = classNames("rounded-lg bg-white shadow flex flex-col justify-between", {
    "ring-2 ring-primary": hover,
  });

  const location = project.currentLocation?.mappableAddress;
  const isDesign = isProjectType(project.conformsTo?.name!).Design;

  return (
    <div className={classes}>
      <div className="space-y-3 p-3">
        <div className="flex justify-between items-center">
          <UserDisplay user={project.primaryAccountable!} />
          {user && <AddStar id={project.id!} owner={project.primaryAccountable!.id} tiny />}
        </div>

        <div onMouseOver={setHoverTrue} onMouseLeave={setHoverFalse}>
          <Link href={`/project/${project.id}`}>
            <a className="space-y-3">
              <ProjectCardImage
                projectType={project.conformsTo!.name as ProjectType}
                image={project.images?.[0] || project.metadata?.image}
              />
              <div>
                <Text variant="headingLg" as="h4">
                  {project.name}
                </Text>
                <StatsDisplay project={project} />
              </div>
              <div className="space-y-1">
                <ProjectTypeChip project={project} link={false} />
                {location && !isDesign && <LocationText color="primary" name={location} />}
              </div>
            </a>
          </Link>
        </div>
      </div>

      {project.classifiedAs?.length && (
        <div className="p-3 border-t-1 border-t-gray-200">
          <BrTags wrap={false} tags={project.classifiedAs || []} />
        </div>
      )}
    </div>
  );
}

/* Partials */

function UserDisplay(props: { user: Partial<Agent> }) {
  const { user } = props;
  return (
    <Link href={`/profile/${user.id}`}>
      <a>
        <div className="flex items-center space-x-2 hover:underline">
          <BrUserAvatar user={user} size="36px" />
          <Text as="p" variant="bodyMd" fontWeight="medium">
            <span className="text-primary">{user.name}</span>
          </Text>
        </div>
      </a>
    </Link>
  );
}

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

function StatsDisplay(props: { project: Partial<EconomicResource> }) {
  const { t } = useTranslation("common");
  const { project } = props;

  const contributorsNum = project.metadata?.contributors?.length;
  const relationsNum = project.metadata?.relations?.length;

  const stats = [
    { stat: contributorsNum, label: t("contributor", { count: contributorsNum }) },
    { stat: relationsNum, label: t("relation", { count: relationsNum }) },
  ];

  return (
    <div className="flex [&>*+*]:before:content-[',_']">
      {stats.map((s, i) => (
        <StatDisplay stat={s.stat} label={s.label} key={s.stat} />
      ))}
    </div>
  );
}
