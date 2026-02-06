import { Icon, Text } from "@bbtgnn/polaris-interfacer";
import { StarFilledMinor, StarOutlineMinor } from "@shopify/polaris-icons";
import classNames from "classnames";
import { useAuth } from "hooks/useAuth";
import useSocial from "hooks/useSocial";
import useWallet from "hooks/useWallet";
import { IdeaPoints } from "lib/PointsDistribution";
import findProjectImages from "lib/findProjectImages";
import { isProjectType } from "lib/isProjectType";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import React, { createContext, useContext, useState } from "react";
import AddStar from "./AddStar";
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

  const classes = classNames("rounded-lg bg-white shadow border border-[#c9cccf] flex flex-col overflow-hidden", {
    "ring-2 ring-primary": hover,
  });

  return (
    <CardProjectContext.Provider value={{ project, setHoverTrue, setHoverFalse, baseUrl }}>
      <div className={classes}>
        {header}
        {body}
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

const ResourceRequirements = () => {
  const { project } = useCardProject();

  const fromMetadata = <T extends { name?: string }>(items: unknown): string[] => {
    if (!Array.isArray(items)) return [];
    return items
      .map(item => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "name" in item) return (item as T).name;
        return undefined;
      })
      .filter((name): name is string => Boolean(name && name.trim()))
      .map(name => name.trim());
  };

  const humanizeSlug = (slug: string): string => {
    return slug
      .replace(/^[a-z]+-/, "")
      .split("-")
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const machineNames = fromMetadata(project.metadata?.machines);
  const materialNames = fromMetadata(project.metadata?.materials);

  const machineTags = (project.classifiedAs || []).filter(tag => tag.startsWith("machine-"));
  const materialTags = (project.classifiedAs || []).filter(tag => tag.startsWith("material-"));

  const machines = machineNames.length > 0 ? machineNames : machineTags.map(humanizeSlug);
  const materials = materialNames.length > 0 ? materialNames : materialTags.map(humanizeSlug);

  const parts: string[] = [];
  if (machines.length > 0) parts.push(`Machines: ${machines.join(", ")}`);
  if (materials.length > 0) parts.push(`Materials: ${materials.join(", ")}`);

  if (parts.length === 0) return null;

  const requirements = parts.join(" • ");

  return (
    <div className="px-4 py-3 border-t-1 border-t-gray-200 bg-[rgba(200,212,229,0.15)]">
      <div className="flex items-start space-x-2">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 flex-shrink-0">
          <path d="M8 0L10.5 5.5L16 6.5L12 10.5L13 16L8 13.5L3 16L4 10.5L0 6.5L5.5 5.5L8 0Z" fill="#6c707c" />
        </svg>
        <Text as="p" variant="bodySm" color="subdued">
          {requirements}
        </Text>
      </div>
    </div>
  );
};

const LicenseFooter = () => {
  const { t } = useTranslation("common");
  const { project } = useCardProject();

  // Check multiple possible license locations
  const license = project.license;
  const metadataLicenses = project.metadata?.licenses;

  // Don't render if no license available
  if (!license && !metadataLicenses) return null;

  const licenseText =
    license == undefined
      ? `${t("LICENSE")}: ${license}`
      : metadataLicenses
          ?.map((l: { scope: string; licenseId: string }) => `${t("LICENSE")} (${l.scope}): ${l.licenseId}`)
          .join(", ");
  return (
    <div className="px-4 py-3 border-t-1 border-t-gray-200">
      <Text as="p" variant="bodySm" fontWeight="medium">
        {licenseText}
      </Text>
    </div>
  );
};

const CardBody = (props: { children?: React.ReactNode; baseUrl?: string }) => {
  const { children } = props;
  const { project, setHoverTrue, setHoverFalse, baseUrl = "/project/" } = useCardProject();
  return (
    <div onMouseOver={setHoverTrue} onMouseLeave={setHoverFalse} className="flex flex-col flex-grow">
      <Link href={`${baseUrl}${project.id}`}>
        <a className="flex-grow">
          <div className="flex flex-col h-full justify-between p-4 space-y-2">{children}</div>
        </a>
      </Link>
    </div>
  );
};

const RemoteImage = () => {
  const { project } = useCardProject();
  const images = findProjectImages(project);
  const user = project.primaryAccountable;
  const isDesign = isProjectType(project.conformsTo?.name!).Design;
  const projectType = project.conformsTo?.name as ProjectType;

  return (
    <div className="relative h-44 bg-gradient-to-b from-[rgba(200,212,229,0.5)] to-[rgba(200,212,229,0.5)] rounded-t-lg overflow-hidden">
      {/* Background Image */}
      <ProjectCardImage projectType={projectType} image={images?.[0]} />

      {/* Project Type Badge - Top Right */}
      {isDesign && (
        <div className="absolute top-4 right-4">
          <ProjectTypeChip project={project} link={false} />
        </div>
      )}

      {/* Bottom Overlay with gradient */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[rgba(0,0,0,0.6)] to-transparent pt-12 pb-3 px-3">
        <div className="flex items-center justify-between">
          {/* User Avatar and Name */}
          {user && (
            <Link href={`/profile/${user.id}`}>
              <a>
                <div className="flex items-center space-x-2">
                  <div className="border-2 border-white rounded-full">
                    <BrUserAvatar user={user} size="28px" />
                  </div>
                  <Text as="span" variant="bodyMd" fontWeight="medium">
                    <span className="text-white line-clamp-1">{user.name}</span>
                  </Text>
                </div>
              </a>
            </Link>
          )}

          {/* Star Count */}
          <StarCount />
        </div>
      </div>
    </div>
  );
};

const ProjectTitleAndStats = () => {
  const { project } = useCardProject();
  return (
    <div className="space-y-2">
      <Text variant="headingLg" as="h4" breakWord={true}>
        <span className="line-clamp-1">{project.name}</span>
      </Text>
      <Text as="p" variant="bodyMd" color="subdued">
        <span className="line-clamp-2">{project.note}</span>
      </Text>
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
        <StatDisplay stat={s.stat} label={s.label} key={i} />
      ))}
    </div>
  );
}

function StarCount() {
  const { project } = useCardProject();
  const { user } = useAuth();
  const { likeER, isLiked, erFollowerLength } = useSocial(project.id);
  const { addIdeaPoints } = useWallet({});
  const hasStarred = project.id ? isLiked(project.id) : false;

  // Format count: 0, 1, 12, 123, 1.2k, 12k, 123k, 1.2M
  const formatCount = (count: number): string => {
    if (count === 0) return "0";
    if (count < 1000) return count.toString();
    if (count < 10000) return `${(count / 1000).toFixed(1)}k`;
    if (count < 1000000) return `${Math.floor(count / 1000)}k`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  const displayCount = formatCount(erFollowerLength);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    await likeER();
    // Award points to project owner on star
    if (project.primaryAccountable?.id) {
      addIdeaPoints(project.primaryAccountable.id, IdeaPoints.OnStar);
    }
  };

  if (!user) {
    // Show non-clickable count if not authenticated
    return (
      <div className="flex items-center space-x-1 text-white">
        <Icon source={StarOutlineMinor} />
        <Text as="span" variant="bodyMd">
          <span className="text-white">{displayCount}</span>
        </Text>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center space-x-1 text-white hover:scale-110 transition-transform"
      aria-label={hasStarred ? "Unstar project" : "Star project"}
    >
      <Icon source={hasStarred ? StarFilledMinor : StarOutlineMinor} />
      <Text as="span" variant="bodyMd">
        <span className="text-white">{displayCount}</span>
      </Text>
    </button>
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
GeneralCard.ResourceRequirements = ResourceRequirements;
GeneralCard.LicenseFooter = LicenseFooter;

export default GeneralCard;
