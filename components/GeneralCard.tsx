import { Text } from "@bbtgnn/polaris-interfacer";
import classNames from "classnames";
import { useAuth } from "hooks/useAuth";
import findProjectImages from "lib/findProjectImages";
import { isProjectType } from "lib/isProjectType";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import React, { createContext, useContext, useState } from "react";
import AddStar from "./AddStar";
import LocationText from "./LocationText";
import ProjectCardImage from "./ProjectCardImage";
import ProjectTypeChip from "./ProjectTypeChip";
import BrTags from "./brickroom/BrTags";
import BrUserAvatar from "./brickroom/BrUserAvatar";
import { ProjectType } from "./types";

export interface GeneralCardProps {
  project: Partial<EconomicResource>;
  children: JSX.Element[];
  baseUrl?: string;
}

interface ProjectContextValue {
  project: Partial<EconomicResource>;
  setHoverTrue: () => void;
  setHoverFalse: () => void;
  baseUrl?: string;
}

const CardProjectContext = createContext<ProjectContextValue>({} as ProjectContextValue);
export const useCardProject = () => useContext(CardProjectContext);

const GeneralCard = (props: GeneralCardProps) => {
  const { project, children, baseUrl } = props;

  const getChildrenOnDisplayName = (children: JSX.Element[], displayName: string) =>
    React.Children.map(children, child => (child.type.DisplayName === displayName ? child : null));

  const header = getChildrenOnDisplayName(children, "CardHeader");
  const body = getChildrenOnDisplayName(children, "CardBody");
  const footer = getChildrenOnDisplayName(children, "CardFooter");

  const [hover, setHover] = useState(false);
  const setHoverTrue = () => setHover(true);
  const setHoverFalse = () => setHover(false);

  const classes = classNames("rounded-lg bg-white shadow flex flex-col justify-between", {
    "ring-2 ring-primary": hover,
  });

  return (
    <CardProjectContext.Provider value={{ project, setHoverTrue, setHoverFalse, baseUrl }}>
      <div className={classes}>
        <div className="flex flex-grow flex-col space-y-3 p-3">
          {header}
          {body}
        </div>
        {footer}
      </div>
    </CardProjectContext.Provider>
  );
};

/* Partials */

const Tags = () => {
  const { project } = useCardProject();
  if (!project.classifiedAs?.length) return null;
  return (
    <div className="p-3 border-t-1 border-t-gray-200">
      <BrTags wrap={false} tags={project.classifiedAs || []} />
    </div>
  );
};

const CardBody = (props: { children?: React.ReactNode; baseUrl?: string }) => {
  const { children } = props;
  const { project, setHoverTrue, setHoverFalse, baseUrl = "/project/" } = useCardProject();
  const location = project.currentLocation?.mappableAddress;
  const isDesign = isProjectType(project.conformsTo?.name!).Design;
  return (
    <div onMouseOver={setHoverTrue} onMouseLeave={setHoverFalse} className="flex flex-col flex-grow">
      <Link href={`${baseUrl}${project.id}`}>
        <a className="space-y-3 flex-grow">
          <div className="flex flex-col h-full justify-between">
            <div>{children}</div>
            <div className="space-y-1">
              {location && !isDesign && <LocationText color="primary" name={location} />}
              <ProjectTypeChip project={project} link={false} />
            </div>
          </div>
        </a>
      </Link>
    </div>
  );
};

const RemoteImage = () => {
  const { project } = useCardProject();
  const images = findProjectImages(project);
  return <ProjectCardImage projectType={project.conformsTo!.name as ProjectType} image={images?.[0]} />;
};

const ProjectTitleAndStats = () => {
  const { project } = useCardProject();
  return (
    <div className="line-clamp-2">
      <Text variant="headingLg" as="h4" breakWord={true}>
        {project.name}
      </Text>
      <StatsDisplay />
    </div>
  );
};

function UserDisplay() {
  const { project } = useCardProject();
  const user = project.primaryAccountable;
  if (!user) return null;
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

const UserAndStarHeader = () => {
  const { project } = useCardProject();
  const { user } = useAuth();
  return (
    <div className="flex justify-between items-center">
      <UserDisplay />
      {user && <AddStar id={project?.id!} owner={project?.primaryAccountable!.id} tiny />}
    </div>
  );
};

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

function StatsDisplay() {
  const { t } = useTranslation("common");
  const { project } = useCardProject();

  const contributorsNum = project.metadata?.contributors?.length;
  const relationsNum = project.metadata?.relations?.length;

  const stats = [
    { stat: contributorsNum, label: t("contributor", { count: contributorsNum }) },
    { stat: relationsNum, label: t("included", { count: relationsNum }) },
  ];

  return (
    <div className="flex [&>*+*]:before:content-[',_']">
      {stats.map((s, i) => (
        <StatDisplay stat={s.stat} label={s.label} key={s.stat} />
      ))}
    </div>
  );
}

const CardFooter = ({ children }: { children: JSX.Element }) => <>{children}</>;
const CardHeader = ({ children }: { children: JSX.Element }) => <>{children}</>;

CardBody.DisplayName = "CardBody";
CardFooter.DisplayName = "CardFooter";
CardHeader.DisplayName = "CardHeader";

GeneralCard.RemoteImage = RemoteImage;
GeneralCard.ProjectTitleAndStats = ProjectTitleAndStats;
GeneralCard.UserAndStarHeader = UserAndStarHeader;
GeneralCard.CardBody = CardBody;
GeneralCard.CardFooter = CardFooter;
GeneralCard.CardHeader = CardHeader;
GeneralCard.Tags = Tags;

export default GeneralCard;
