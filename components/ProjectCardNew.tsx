// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { BookmarkIcon, LocationMarkerIcon, StarIcon } from "@heroicons/react/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/solid";
import { useAuth } from "hooks/useAuth";
import useSocial from "hooks/useSocial";
import useWallet from "hooks/useWallet";
import findProjectImages from "lib/findProjectImages";
import { isProjectType } from "lib/isProjectType";
import { IdeaPoints } from "lib/PointsDistribution";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import React, { useState } from "react";
import BrUserAvatar from "./brickroom/BrUserAvatar";
import EntityTypeIcon from "./EntityTypeIcon";
import ProjectCardImage from "./ProjectCardImage";
import { ProjectType } from "./types";

interface ProjectCardNewProps {
  project: Partial<EconomicResource>;
}

const entityTypeColors: Record<string, string> = {
  [ProjectType.DESIGN]: "var(--ifr-green)",
  [ProjectType.PRODUCT]: "var(--ifr-type-product)",
  [ProjectType.SERVICE]: "var(--ifr-type-service)",
  [ProjectType.DPP]: "var(--ifr-type-dpp)",
};

const entityTypeBg: Record<string, string> = {
  [ProjectType.DESIGN]: "var(--ifr-green)",
  [ProjectType.PRODUCT]: "var(--ifr-type-product)",
  [ProjectType.SERVICE]: "var(--ifr-type-service)",
  [ProjectType.DPP]: "var(--ifr-type-dpp)",
};

function getProjectType(project: Partial<EconomicResource>): ProjectType {
  const name = project.conformsTo?.name;
  if (!name) return ProjectType.DESIGN;
  const check = isProjectType(name);
  if (check[ProjectType.PRODUCT]) return ProjectType.PRODUCT;
  if (check[ProjectType.SERVICE]) return ProjectType.SERVICE;
  if (check[ProjectType.DPP]) return ProjectType.DPP;
  if (check[ProjectType.MACHINE]) return ProjectType.MACHINE;
  return ProjectType.DESIGN;
}

function humanizeSlug(slug: string): string {
  return slug
    .replace(/^[a-z]+-/, "")
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCount(count: number): string {
  if (count === 0) return "0";
  if (count < 1000) return count.toString();
  if (count < 10000) return `${(count / 1000).toFixed(1)}k`;
  if (count < 1000000) return `${Math.floor(count / 1000)}k`;
  return `${(count / 1000000).toFixed(1)}M`;
}

export default function ProjectCardNew({ project }: ProjectCardNewProps) {
  const { t } = useTranslation("common");
  const { user: authUser } = useAuth();
  const { likeER, isLiked, erFollowerLength } = useSocial(project.id);
  const { addIdeaPoints } = useWallet({});
  const [bookmarked, setBookmarked] = useState(false);

  const projectType = getProjectType(project);
  const images = findProjectImages(project);
  const user = project.primaryAccountable;
  const hasStarred = project.id ? isLiked(project.id) : false;
  const displayCount = formatCount(erFollowerLength);

  // Extract tags (filter out encoded machine/material tags)
  const tags = (project.classifiedAs || [])
    .filter(
      tag =>
        !tag.startsWith("machine-") &&
        !tag.startsWith("material-") &&
        !tag.startsWith("power_") &&
        !tag.startsWith("replicability-") &&
        !tag.startsWith("recyclability-") &&
        !tag.startsWith("repairability") &&
        !tag.startsWith("env_")
    )
    .map(tag => (tag.startsWith("category-") ? humanizeSlug(tag) : decodeURIComponent(tag)))
    .slice(0, 4);

  // Design-specific: requirements
  const machineTags = (project.classifiedAs || []).filter(tag => tag.startsWith("machine-")).map(humanizeSlug);
  const requirements = machineTags.length > 0 ? machineTags.join(", ") : undefined;

  // Product-specific: materials
  const materialTags = (project.classifiedAs || []).filter(tag => tag.startsWith("material-")).map(humanizeSlug);

  // License
  const license = project.license || project.metadata?.licenses?.[0]?.licenseId;

  const handleStar = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!authUser) return;
    await likeER();
    if (project.primaryAccountable?.id) {
      addIdeaPoints(project.primaryAccountable.id, IdeaPoints.OnStar);
    }
  };

  return (
    <Link href={`/project/${project.id}`}>
      <a className="block">
        <div
          className="bg-ifr-surface border border-ifr overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-pointer"
          style={{ borderRadius: "var(--ifr-radius-sm)" }}
        >
          {/* Image Section */}
          <div className="relative" style={{ height: "var(--ifr-card-image-height)" }}>
            <ProjectCardImage projectType={projectType} image={images?.[0]} />

            {/* Gradient overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[52px]"
              style={{ background: "linear-gradient(to top, var(--ifr-gradient-dark), transparent)" }}
            />

            {/* Type label */}
            <div className="absolute top-3 left-3.5 z-10">
              <div
                className="inline-flex items-center gap-2 px-2 py-1"
                style={{
                  backgroundColor: entityTypeBg[projectType],
                  borderRadius: "var(--ifr-radius-sm)",
                }}
              >
                <EntityTypeIcon type={projectType} size="default" fill="#ffffff" />
                <span
                  className="text-white whitespace-nowrap"
                  style={{
                    fontFamily: "var(--ifr-font-body)",
                    fontSize: "var(--ifr-fs-base)",
                    fontWeight: "var(--ifr-fw-semibold)",
                    lineHeight: "16px",
                  }}
                >
                  {projectType}
                </span>
              </div>
            </div>

            {/* Bookmark */}
            <div className="absolute top-3 right-3.5 z-10">
              <button
                className="bg-ifr-bookmark border border-ifr rounded-full w-8 h-8 flex items-center justify-center hover:bg-white transition-colors"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  setBookmarked(b => !b);
                }}
              >
                <BookmarkIcon
                  className="w-4 h-4 text-ifr-text-primary"
                  fill={bookmarked ? "var(--ifr-text-primary)" : "none"}
                />
              </button>
            </div>

            {/* Author + Star count */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              {user && (
                <div className="flex items-center gap-2">
                  <div className="border-2 border-white rounded-full">
                    <BrUserAvatar user={user} size="28px" />
                  </div>
                  <span
                    className="text-white line-clamp-1"
                    style={{
                      fontFamily: "var(--ifr-font-body)",
                      fontSize: "var(--ifr-fs-base)",
                      fontWeight: "var(--ifr-fw-medium)",
                    }}
                  >
                    {user.name}
                  </span>
                </div>
              )}

              {/* Star count */}
              <div
                className="flex items-center gap-1 px-2 py-1 cursor-pointer"
                style={{
                  backgroundColor: "var(--ifr-overlay-dark)",
                  borderRadius: "var(--ifr-radius-sm)",
                }}
                onClick={handleStar}
              >
                {hasStarred ? (
                  <StarIconSolid className="w-5 h-5 text-ifr-yellow" />
                ) : (
                  <StarIcon className="w-5 h-5 text-white" />
                )}
                <span
                  className="text-white"
                  style={{
                    fontFamily: "var(--ifr-font-body)",
                    fontSize: "var(--ifr-fs-base)",
                    fontWeight: "var(--ifr-fw-medium)",
                  }}
                >
                  {displayCount}
                </span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex flex-col gap-3 flex-1 p-4">
            {/* Title + Description */}
            <div className="flex flex-col gap-1">
              <h3
                className="text-ifr-text-primary leading-[30px] truncate"
                style={{
                  fontFamily: "var(--ifr-font-heading)",
                  fontSize: "var(--ifr-fs-lg)",
                  fontWeight: "var(--ifr-fw-bold)",
                }}
              >
                {project.name}
              </h3>
              <p
                className="text-ifr-text-secondary leading-[21px] line-clamp-2"
                style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)" }}
              >
                {project.note}
              </p>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-ifr-hover border border-ifr px-1.5 py-px text-ifr-text-primary"
                    style={{
                      borderRadius: "var(--ifr-radius-sm)",
                      fontFamily: "var(--ifr-font-body)",
                      fontSize: "var(--ifr-fs-base)",
                      fontWeight: "var(--ifr-fw-medium)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* DESIGN footer */}
            {projectType === ProjectType.DESIGN && (
              <>
                {requirements && (
                  <div className="border-t border-ifr pt-2 flex items-start gap-2">
                    <svg className="w-4 h-4 text-ifr-text-secondary mt-0.5 shrink-0" fill="none" viewBox="0 0 16 16">
                      <path
                        d="M8 0L10.5 5.5L16 6.5L12 10.5L13 16L8 13.5L3 16L4 10.5L0 6.5L5.5 5.5L8 0Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span
                      className="text-ifr-text-secondary text-sm truncate"
                      style={{ fontFamily: "var(--ifr-font-body)" }}
                    >
                      {requirements}
                    </span>
                  </div>
                )}
                {license && (
                  <div className="border-t border-ifr pt-2 flex items-center justify-between">
                    <span
                      className="text-ifr-text-secondary"
                      style={{
                        fontFamily: "var(--ifr-font-body)",
                        fontSize: "var(--ifr-fs-base)",
                        fontWeight: "var(--ifr-fw-medium)",
                      }}
                    >
                      {t("LICENSE: {{license}}", { license })}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* PRODUCT footer */}
            {projectType === ProjectType.PRODUCT && (
              <>
                {materialTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {materialTags.slice(0, 4).map(mat => (
                      <span
                        key={mat}
                        className="bg-ifr-hover-light border border-ifr px-1.5 py-px text-ifr-text-secondary"
                        style={{
                          borderRadius: "var(--ifr-radius-sm)",
                          fontFamily: "var(--ifr-font-body)",
                          fontSize: "var(--ifr-fs-sm)",
                        }}
                      >
                        {mat}
                      </span>
                    ))}
                    {materialTags.length > 4 && (
                      <span className="text-ifr-text-secondary px-1 py-px text-xs">+{materialTags.length - 4}</span>
                    )}
                  </div>
                )}
              </>
            )}

            {/* SERVICE footer */}
            {projectType === ProjectType.SERVICE && project.currentLocation && (
              <div className="border-t border-ifr pt-2 flex items-center gap-1.5">
                <LocationMarkerIcon className="w-3.5 h-3.5 text-ifr-text-secondary shrink-0" />
                <span
                  className="text-ifr-text-secondary"
                  style={{
                    fontFamily: "var(--ifr-font-body)",
                    fontSize: "var(--ifr-fs-base)",
                    fontWeight: "var(--ifr-fw-medium)",
                  }}
                >
                  {project.currentLocation.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </a>
    </Link>
  );
}
