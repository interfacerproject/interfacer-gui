// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { ChevronLeft, ChevronRight } from "@carbon/icons-react";
import { BookmarkIcon, ExternalLinkIcon, ShareIcon, StarIcon } from "@heroicons/react/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/solid";
import BrUserAvatar from "components/brickroom/BrUserAvatar";
import DetailSection from "components/DetailSection";
import EntityTypeIcon from "components/EntityTypeIcon";
import { useProject } from "components/layout/FetchProjectLayout";
import ProjectCardImage from "components/ProjectCardImage";
import { ProjectType } from "components/types";
import { useAuth } from "hooks/useAuth";
import useSocial from "hooks/useSocial";
import useWallet from "hooks/useWallet";
import findProjectImages from "lib/findProjectImages";
import { isProjectType } from "lib/isProjectType";
import MdParser from "lib/MdParser";
import { IdeaPoints } from "lib/PointsDistribution";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

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

const typeColors: Record<string, string> = {
  [ProjectType.DESIGN]: "var(--ifr-green)",
  [ProjectType.PRODUCT]: "var(--ifr-type-product)",
  [ProjectType.SERVICE]: "var(--ifr-type-service)",
  [ProjectType.DPP]: "var(--ifr-type-dpp)",
};

interface ProjectSidebarNewProps {
  project: Partial<EconomicResource>;
  projectType: ProjectType;
}

/** Redesigned sidebar following DTEC prototype */
function ProjectSidebarNew({ project, projectType }: ProjectSidebarNewProps) {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const { likeER, isLiked, erFollowerLength } = useSocial(project.id);
  const hasStarred = project.id ? isLiked(project.id) : false;
  const { addIdeaPoints } = useWallet({});
  const color = typeColors[projectType] || "var(--ifr-green)";

  const handleStar = async () => {
    if (!project.id || !project.primaryAccountable?.id) return;
    await likeER();
    addIdeaPoints(project.primaryAccountable.id, IdeaPoints.OnStar);
  };

  // Decode tags
  const tags = (project.classifiedAs || []).filter(
    (c: string) => !c.startsWith("machine-") && !c.startsWith("material-") && !c.startsWith("category-")
  );
  const machines = (project.classifiedAs || [])
    .filter((c: string) => c.startsWith("machine-"))
    .map((c: string) => decodeURIComponent(c.replace("machine-", "")).replace(/-/g, " "));

  return (
    <div className="w-[300px] shrink-0">
      <div className="sticky flex flex-col gap-4" style={{ top: "calc(var(--ifr-topbar-height) + 80px)" }}>
        {/* CTA */}
        <div className="bg-ifr-surface border border-ifr rounded-ifr-md p-5 flex flex-col gap-4">
          {projectType === ProjectType.DESIGN && (
            <button
              type="button"
              className="w-full text-white border-none cursor-pointer flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
              style={{
                height: "var(--ifr-control-height)",
                borderRadius: "var(--ifr-radius-md)",
                backgroundColor: "var(--ifr-yellow)",
                fontFamily: "var(--ifr-font-body)",
                fontSize: "var(--ifr-fs-md)",
                fontWeight: "var(--ifr-fw-semibold)",
              }}
            >
              {t("Build It Yourself")}
            </button>
          )}
          {projectType === ProjectType.PRODUCT && (
            <button
              type="button"
              className="w-full text-white border-none cursor-pointer flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
              style={{
                height: "var(--ifr-control-height)",
                borderRadius: "var(--ifr-radius-md)",
                backgroundColor: "var(--ifr-type-product)",
                fontFamily: "var(--ifr-font-body)",
                fontSize: "var(--ifr-fs-md)",
                fontWeight: "var(--ifr-fw-semibold)",
              }}
            >
              {t("Contact Manufacturer")}
            </button>
          )}
          {projectType === ProjectType.SERVICE && (
            <button
              type="button"
              className="w-full text-white border-none cursor-pointer flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
              style={{
                height: "var(--ifr-control-height)",
                borderRadius: "var(--ifr-radius-md)",
                backgroundColor: "var(--ifr-type-service)",
                fontFamily: "var(--ifr-font-body)",
                fontSize: "var(--ifr-fs-md)",
                fontWeight: "var(--ifr-fw-semibold)",
              }}
            >
              {t("Request a Quote")}
            </button>
          )}

          {/* Actions row */}
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 bg-ifr-surface border border-ifr cursor-pointer hover:bg-ifr-hover transition-colors"
              style={{
                height: "var(--ifr-control-height)",
                borderRadius: "var(--ifr-radius-sm)",
                fontFamily: "var(--ifr-font-body)",
                fontSize: "var(--ifr-fs-base)",
              }}
            >
              <BookmarkIcon className="w-4 h-4 text-ifr-text-secondary" />
              <span className="text-ifr-text-primary" style={{ fontWeight: "var(--ifr-fw-medium)" }}>
                {t("Save")}
              </span>
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 bg-ifr-surface border border-ifr cursor-pointer hover:bg-ifr-hover transition-colors"
              style={{
                height: "var(--ifr-control-height)",
                borderRadius: "var(--ifr-radius-sm)",
                fontFamily: "var(--ifr-font-body)",
                fontSize: "var(--ifr-fs-base)",
              }}
            >
              <ShareIcon className="w-4 h-4 text-ifr-text-secondary" />
              <span className="text-ifr-text-primary" style={{ fontWeight: "var(--ifr-fw-medium)" }}>
                {t("Share")}
              </span>
            </button>
          </div>
        </div>

        {/* Created by */}
        {project.primaryAccountable && (
          <div className="bg-ifr-surface border border-ifr rounded-ifr-md p-5">
            <p
              className="text-ifr-text-secondary mb-3"
              style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
            >
              {t("Created by")}
            </p>
            <Link href={`/profile/${project.primaryAccountable.id}`}>
              <a className="flex items-center gap-3 no-underline group">
                <BrUserAvatar userId={project.primaryAccountable.id} size="36px" />
                <div>
                  <p
                    className="text-ifr-text-primary group-hover:underline"
                    style={{
                      fontFamily: "var(--ifr-font-body)",
                      fontSize: "var(--ifr-fs-md)",
                      fontWeight: "var(--ifr-fw-medium)",
                    }}
                  >
                    {project.primaryAccountable.name}
                  </p>
                  {project.primaryAccountable.primaryLocation?.name && (
                    <p
                      className="text-ifr-text-secondary"
                      style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
                    >
                      {project.primaryAccountable.primaryLocation.name}
                    </p>
                  )}
                </div>
              </a>
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="bg-ifr-surface border border-ifr rounded-ifr-md p-5 flex flex-col gap-3">
          {/* Stars */}
          <div className="flex items-center justify-between">
            <span
              className="text-ifr-text-secondary"
              style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)" }}
            >
              {t("Stars")}
            </span>
            <button
              type="button"
              onClick={user ? handleStar : undefined}
              className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer hover:opacity-80"
            >
              {hasStarred ? (
                <StarIconSolid className="w-4 h-4" style={{ color: "var(--ifr-yellow)" }} />
              ) : (
                <StarIcon className="w-4 h-4 text-ifr-text-secondary" />
              )}
              <span
                className="text-ifr-text-primary"
                style={{
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-base)",
                  fontWeight: "var(--ifr-fw-medium)",
                }}
              >
                {erFollowerLength || 0}
              </span>
            </button>
          </div>

          {/* License */}
          {project.license && (
            <div className="flex items-center justify-between">
              <span
                className="text-ifr-text-secondary"
                style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)" }}
              >
                {t("License")}
              </span>
              <span
                className="text-ifr-text-primary"
                style={{
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-base)",
                  fontWeight: "var(--ifr-fw-medium)",
                }}
              >
                {project.license}
              </span>
            </div>
          )}

          {/* Repository */}
          {project.repo && (
            <div className="flex items-center justify-between">
              <span
                className="text-ifr-text-secondary"
                style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)" }}
              >
                {t("Repository")}
              </span>
              <a
                href={project.repo.startsWith("http") ? project.repo : `https://${project.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-ifr-green hover:underline"
                style={{
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-base)",
                  fontWeight: "var(--ifr-fw-medium)",
                }}
              >
                {t("View")}
                <ExternalLinkIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* ID */}
          <div className="flex items-center justify-between">
            <span
              className="text-ifr-text-secondary"
              style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)" }}
            >
              {t("ID")}
            </span>
            <span className="text-ifr-text-primary font-mono text-xs truncate max-w-[150px]" title={project.id}>
              {project.id}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Image gallery with thumbnail strip */
function ImageGallery({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { t } = useTranslation("common");

  if (!images.length) {
    return (
      <div
        className="w-full bg-ifr-surface border border-ifr rounded-ifr-md overflow-hidden"
        style={{ height: "520px" }}
      >
        <ProjectCardImage image={undefined} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div
        className="relative w-full bg-ifr-surface border border-ifr rounded-ifr-md overflow-hidden group"
        style={{ height: "520px" }}
      >
        <img src={images[activeIndex]} alt="" className="w-full h-full object-cover" />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActiveIndex(i => (i > 0 ? i - 1 : images.length - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white border border-ifr rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex(i => (i < images.length - 1 ? i + 1 : 0))}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white border border-ifr rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>

            {/* Counter */}
            <div
              className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 text-white text-sm rounded-full"
              style={{ fontFamily: "var(--ifr-font-body)" }}
            >
              {activeIndex + 1}/{images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 w-16 h-16 rounded-ifr-sm overflow-hidden border-2 cursor-pointer transition-colors ${
                i === activeIndex ? "border-ifr-green" : "border-transparent hover:border-ifr"
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Tag badge */
function TagBadgeDetail({ text }: { text: string }) {
  return (
    <span
      className="text-ifr-text-primary bg-ifr-hover border border-ifr"
      style={{
        fontFamily: "var(--ifr-font-body)",
        fontSize: "var(--ifr-fs-sm)",
        fontWeight: "var(--ifr-fw-medium)",
        padding: "3px 9px",
        borderRadius: "var(--ifr-radius-sm)",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

/** Main detail page content. Requires FetchProjectLayout wrapper. */
export default function ProjectDetailNew() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { project, isOwner } = useProject();
  const projectType = getProjectType(project);
  const color = typeColors[projectType] || "var(--ifr-green)";
  const images = useMemo(() => findProjectImages(project), [project]);

  // Decode tags
  const tags = useMemo(
    () =>
      (project.classifiedAs || [])
        .filter(
          (c: string) =>
            !c.startsWith("machine-") &&
            !c.startsWith("material-") &&
            !c.startsWith("category-") &&
            !c.startsWith("power_compat-")
        )
        .map((c: string) => decodeURIComponent(c)),
    [project.classifiedAs]
  );

  const machines = useMemo(
    () =>
      (project.classifiedAs || [])
        .filter((c: string) => c.startsWith("machine-"))
        .map((c: string) =>
          decodeURIComponent(c.replace("machine-", ""))
            .split("-")
            .filter(Boolean)
            .map(p => p.charAt(0).toUpperCase() + p.slice(1))
            .join(" ")
        ),
    [project.classifiedAs]
  );

  const materials = useMemo(
    () =>
      (project.classifiedAs || [])
        .filter((c: string) => c.startsWith("material-"))
        .map((c: string) =>
          decodeURIComponent(c.replace("material-", ""))
            .split("-")
            .filter(Boolean)
            .map(p => p.charAt(0).toUpperCase() + p.slice(1))
            .join(" ")
        ),
    [project.classifiedAs]
  );

  // Breadcrumb
  const typeLabel =
    projectType === ProjectType.DESIGN ? "Designs" : projectType === ProjectType.PRODUCT ? "Products" : "Services";
  const typeHref = `/${typeLabel.toLowerCase()}`;

  return (
    <div className="flex-1 bg-ifr-page" style={{ fontFamily: "var(--ifr-font-body)" }}>
      <div className="max-w-[1280px] mx-auto px-6 py-8 flex gap-8 items-start">
        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm">
            <Link href={typeHref}>
              <a className="text-ifr-text-primary hover:underline" style={{ fontWeight: "var(--ifr-fw-medium)" }}>
                {t(typeLabel)}
              </a>
            </Link>
            <span className="text-ifr-text-secondary">/</span>
            <span className="text-ifr-text-secondary truncate">{project.name}</span>
          </nav>

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              {/* Type badge + ID */}
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-2 shrink-0"
                  style={{
                    height: "28px",
                    borderRadius: "var(--ifr-radius-sm)",
                    backgroundColor: color,
                  }}
                >
                  <EntityTypeIcon type={projectType} size="small" fill="#fff" />
                  <span
                    className="text-white"
                    style={{
                      fontFamily: "var(--ifr-font-body)",
                      fontSize: "var(--ifr-fs-sm)",
                      fontWeight: "var(--ifr-fw-semibold)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {projectType}
                  </span>
                </div>
                <span className="text-ifr-text-secondary font-mono truncate" style={{ fontSize: "var(--ifr-fs-sm)" }}>
                  {project.id}
                </span>
              </div>

              {/* Title */}
              <h1
                className="text-ifr-text-primary m-0"
                style={{
                  fontFamily: "var(--ifr-font-heading)",
                  fontSize: "var(--ifr-fs-2xl)",
                  fontWeight: "var(--ifr-fw-bold)",
                  lineHeight: "1.2",
                }}
              >
                {project.name}
              </h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0 ml-4">
              {isOwner && (
                <Link href={`/project/${project.id}/edit`}>
                  <a
                    className="flex items-center gap-1.5 px-3 bg-ifr-surface border border-ifr hover:bg-ifr-hover transition-colors no-underline"
                    style={{
                      height: "32px",
                      borderRadius: "var(--ifr-radius-sm)",
                      fontFamily: "var(--ifr-font-body)",
                      fontSize: "var(--ifr-fs-base)",
                      fontWeight: "var(--ifr-fw-medium)",
                      color: "var(--ifr-text-primary)",
                    }}
                  >
                    {t("Edit")}
                  </a>
                </Link>
              )}
            </div>
          </div>

          {/* Image gallery */}
          <ImageGallery images={images} />

          {/* Collapsible sections */}
          <div className="flex flex-col gap-4 mt-4">
            {/* Overview */}
            <DetailSection
              icon={<EntityTypeIcon type={projectType} size="default" fill={color} />}
              iconBg="bg-ifr-hover"
              title={t("Overview")}
              subtitle={t("Description and key features")}
              defaultOpen
              sectionId="overview"
            >
              <div className="flex flex-col gap-6">
                {project.note && (
                  <div
                    className="prose max-w-none text-ifr-text-primary"
                    style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-md)" }}
                    dangerouslySetInnerHTML={{ __html: MdParser.render(project.note) }}
                  />
                )}

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: string) => (
                      <TagBadgeDetail key={tag} text={tag} />
                    ))}
                  </div>
                )}
              </div>
            </DetailSection>

            {/* Equipment — designs */}
            {(projectType === ProjectType.DESIGN || projectType === ProjectType.MACHINE) && machines.length > 0 && (
              <DetailSection
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                      stroke={color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
                iconBg="bg-ifr-hover"
                title={t("Equipment Needed")}
                subtitle={t("{{count}} machines required", { count: machines.length })}
                sectionId="equipment"
              >
                <div className="flex flex-col gap-3">
                  {machines.map((m: string) => (
                    <div key={m} className="flex items-center gap-2 p-3 bg-ifr-hover rounded-ifr-sm">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M22 11.08V12a10 10 0 11-5.93-9.14"
                          stroke={color}
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <polyline
                          points="22 4 12 14.01 9 11.01"
                          stroke={color}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span
                        className="text-ifr-text-primary"
                        style={{
                          fontFamily: "var(--ifr-font-body)",
                          fontSize: "var(--ifr-fs-md)",
                          fontWeight: "var(--ifr-fw-medium)",
                        }}
                      >
                        {m}
                      </span>
                    </div>
                  ))}
                </div>
              </DetailSection>
            )}

            {/* Materials — designs and products */}
            {materials.length > 0 && (
              <DetailSection
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                      stroke={color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="3.27 6.96 12 12.01 20.73 6.96"
                      stroke={color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="12"
                      y1="22.08"
                      x2="12"
                      y2="12"
                      stroke={color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
                iconBg="bg-ifr-hover"
                title={t("Materials")}
                subtitle={t("{{count}} materials listed", { count: materials.length })}
                sectionId="materials"
              >
                <div className="flex flex-wrap gap-2">
                  {materials.map((m: string) => (
                    <TagBadgeDetail key={m} text={m} />
                  ))}
                </div>
              </DetailSection>
            )}

            {/* Location — services and products with location */}
            {project.currentLocation?.name && (
              <DetailSection
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                      stroke={color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" />
                  </svg>
                }
                iconBg="bg-ifr-hover"
                title={t("Location")}
                subtitle={project.currentLocation.name}
                sectionId="location"
              >
                <div className="flex flex-col gap-2">
                  <p className="text-ifr-text-primary" style={{ fontSize: "var(--ifr-fs-md)" }}>
                    {project.currentLocation.mappableAddress || project.currentLocation.name}
                  </p>
                </div>
              </DetailSection>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <ProjectSidebarNew project={project} projectType={projectType} />
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className="lg:hidden px-6 pb-8">
        <ProjectSidebarNew project={project} projectType={projectType} />
      </div>
    </div>
  );
}
