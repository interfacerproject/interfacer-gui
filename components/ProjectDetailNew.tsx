// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { ChevronLeft, ChevronRight } from "@carbon/icons-react";
import { BookmarkIcon, ExternalLinkIcon, StarIcon } from "@heroicons/react/outline";
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

  // Extract metadata fields (product-specific)
  const meta = (project.metadata || {}) as Record<string, any>;
  const price = meta.price as string | undefined;
  const availability = meta.availability as string | undefined;
  const websiteLink = meta.websiteLink as string | undefined;
  const basedOnDesign = meta.basedOnDesign as { id?: string; name?: string } | string | undefined;

  return (
    <div className="w-[300px] shrink-0">
      <div className="sticky flex flex-col gap-4" style={{ top: "calc(var(--ifr-topbar-height) + 80px)" }}>
        {/* CTA */}
        <div className="bg-ifr-surface border border-ifr rounded-ifr-md p-5 flex flex-col gap-4">
          {/* Product: Price & Availability */}
          {projectType === ProjectType.PRODUCT && price && (
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline gap-1.5">
                <p
                  className="text-ifr-text-primary m-0"
                  style={{
                    fontFamily: "var(--ifr-font-heading)",
                    fontSize: "var(--ifr-fs-2xl)",
                    fontWeight: "var(--ifr-fw-bold)",
                    lineHeight: "1.2",
                  }}
                >
                  {price}
                </p>
                <span
                  className="text-ifr-text-secondary"
                  style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
                >
                  {t("estimated")}
                </span>
              </div>
              {availability && (
                <div className="flex items-center gap-1.5">
                  <div
                    className="shrink-0"
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "var(--ifr-radius-full)",
                      backgroundColor: "var(--ifr-type-product)",
                    }}
                  />
                  <span
                    className="text-ifr-text-primary"
                    style={{
                      fontFamily: "var(--ifr-font-body)",
                      fontSize: "var(--ifr-fs-base)",
                      fontWeight: "var(--ifr-fw-medium)",
                    }}
                  >
                    {availability}
                  </span>
                </div>
              )}
              <span
                className="text-ifr-text-secondary"
                style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
              >
                {t("Contact the manufacturer for accurate pricing and availability details.")}
              </span>
            </div>
          )}

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
                backgroundColor: "var(--ifr-yellow)",
                fontFamily: "var(--ifr-font-body)",
                fontSize: "var(--ifr-fs-md)",
                fontWeight: "var(--ifr-fw-semibold)",
              }}
            >
              {t("Contact Manufacturer")}
            </button>
          )}
          {projectType === ProjectType.PRODUCT && websiteLink && (
            <a
              href={websiteLink.startsWith("http") ? websiteLink : `https://${websiteLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 no-underline bg-ifr-surface border border-ifr cursor-pointer hover:bg-ifr-hover transition-colors"
              style={{
                height: "var(--ifr-control-height)",
                borderRadius: "var(--ifr-radius-sm)",
                fontFamily: "var(--ifr-font-body)",
                fontSize: "var(--ifr-fs-md)",
                fontWeight: "var(--ifr-fw-medium)",
                color: "var(--ifr-text-primary)",
              }}
            >
              <ExternalLinkIcon className="w-4 h-4" />
              {t("Visit Store")}
            </a>
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

          {/* Divider */}
          <div className="w-full" style={{ height: "1px", backgroundColor: "var(--ifr-border)" }} />

          {/* Save + Watch links */}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              className="w-full flex items-center gap-2 px-1 py-1.5 bg-transparent border-none cursor-pointer hover:bg-ifr-hover transition-colors"
              style={{ borderRadius: "var(--ifr-radius-sm)" }}
            >
              <BookmarkIcon className="w-4 h-4 text-ifr-text-secondary" />
              <span
                className="text-ifr-text-secondary"
                style={{
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-base)",
                }}
              >
                {t("Save to My Projects")}
              </span>
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-2 px-1 py-1.5 bg-transparent border-none cursor-pointer hover:bg-ifr-hover transition-colors"
              style={{ borderRadius: "var(--ifr-radius-sm)" }}
            >
              <StarIcon className="w-4 h-4 text-ifr-text-secondary" />
              <span
                className="text-ifr-text-secondary"
                style={{
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-base)",
                }}
              >
                {t("Watch Project")}
              </span>
            </button>
          </div>
        </div>

        {/* Created by / Manufactured by */}
        {project.primaryAccountable && (
          <div className="bg-ifr-surface border border-ifr rounded-ifr-md p-5">
            <p
              className="text-ifr-text-secondary mb-3"
              style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
            >
              {projectType === ProjectType.PRODUCT ? t("Manufactured by") : t("Created by")}
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

        {/* Based on design — products only */}
        {projectType === ProjectType.PRODUCT && basedOnDesign && (
          <div className="bg-ifr-surface border border-ifr rounded-ifr-md p-5 flex flex-col gap-2">
            <p
              className="text-ifr-text-secondary m-0"
              style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)" }}
            >
              {t("Based on open source design")}
            </p>
            <div className="flex items-center gap-2.5 p-2.5 border border-ifr rounded-ifr-sm hover:bg-ifr-hover transition-colors">
              <div
                className="shrink-0 flex items-center justify-center"
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "var(--ifr-radius-sm)",
                  backgroundColor: "var(--ifr-green)",
                }}
              >
                <EntityTypeIcon type={ProjectType.DESIGN} size="small" fill="#ffffff" />
              </div>
              <span
                className="text-ifr-text-primary truncate flex-1"
                style={{
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-base)",
                  fontWeight: "var(--ifr-fw-medium)",
                }}
              >
                {typeof basedOnDesign === "string" ? basedOnDesign : basedOnDesign.name || t("Design")}
              </span>
              <ExternalLinkIcon className="w-3.5 h-3.5 text-ifr-green shrink-0" />
            </div>
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

/** DPP field row */
function DppFieldRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 w-full">
      <span
        className="text-ifr-text-secondary shrink-0"
        style={{
          fontFamily: "var(--ifr-font-body)",
          fontSize: "var(--ifr-fs-base)",
          lineHeight: "24px",
          width: "180px",
        }}
      >
        {label}
      </span>
      <span
        className="text-ifr-text-primary"
        style={{
          fontFamily: "var(--ifr-font-body)",
          fontSize: "var(--ifr-fs-md)",
          fontWeight: "var(--ifr-fw-medium)",
          lineHeight: "24px",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/** Compact DPP display for the Product Passport section */
function DppDisplay({ dpp }: { dpp: Record<string, string> }) {
  const { t } = useTranslation("common");
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <DppFieldRow label={t("Brand Name")} value={dpp.brandName} />
        <DppFieldRow label={t("Product Name")} value={dpp.productName} />
        <DppFieldRow label={t("Country of Sale")} value={dpp.countrySale} />
        <DppFieldRow label={t("Country of Origin")} value={dpp.countryOrigin} />
        <DppFieldRow label={t("Dimensions")} value={dpp.dimensions} />
        <DppFieldRow label={t("Model Name")} value={dpp.modelName} />
        <DppFieldRow label={t("Net Weight")} value={dpp.netWeight ? `${dpp.netWeight} kg` : undefined} />
        <DppFieldRow label={t("Condition")} value={dpp.conditionProduct} />
        <DppFieldRow
          label={t("Warranty Duration")}
          value={dpp.warrantyDuration ? `${dpp.warrantyDuration} years` : undefined}
        />
        <DppFieldRow
          label={t("CE Marking")}
          value={dpp.ceMarking === "yes" ? t("Yes") : dpp.ceMarking === "no" ? t("No") : undefined}
        />
        <DppFieldRow
          label={t("ROHS Compliance")}
          value={dpp.rohsCompliance === "yes" ? t("Yes") : dpp.rohsCompliance === "no" ? t("No") : undefined}
        />
        <DppFieldRow
          label={t("Energy Consumption")}
          value={dpp.energyConsumption ? `${dpp.energyConsumption} kWh` : undefined}
        />
        <DppFieldRow label={t("CO₂ Emissions")} value={dpp.co2eEmissions ? `${dpp.co2eEmissions} kg` : undefined} />
      </div>
    </div>
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

            {/* Product Passport — products only */}
            {projectType === ProjectType.PRODUCT && (project.metadata as Record<string, any>)?.dpp && (
              <DetailSection
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
                      stroke={color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect x="9" y="3" width="6" height="4" rx="1" stroke={color} strokeWidth="2" />
                    <line x1="9" y1="12" x2="15" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
                    <line x1="9" y1="16" x2="13" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                }
                iconBg="bg-ifr-hover"
                title={t("Product Passport")}
                subtitle={t("Digital product passport data")}
                sectionId="product-passport"
              >
                <DppDisplay dpp={(project.metadata as Record<string, any>).dpp as Record<string, string>} />
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
