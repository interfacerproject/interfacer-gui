// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { ChevronDown, ChevronLeft, ChevronRight, Location } from "@carbon/icons-react";
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
import { ReactNode, useMemo, useState } from "react";

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
          <div className="bg-ifr-surface border border-ifr rounded-ifr-md p-5 flex flex-col gap-3">
            <p
              className="text-ifr-text-secondary m-0"
              style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
            >
              {t("Based on open source design")}
            </p>
            {typeof basedOnDesign === "object" && basedOnDesign.id ? (
              <Link href={`/project/${basedOnDesign.id}`}>
                <a className="flex items-center gap-2.5 p-3 border border-ifr rounded-ifr-sm hover:bg-ifr-hover transition-colors no-underline shadow-sm">
                  <div
                    className="shrink-0 flex items-center justify-center"
                    style={{
                      width: "32px",
                      height: "32px",
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
                    {basedOnDesign.name || t("Design")}
                  </span>
                  <ExternalLinkIcon className="w-3.5 h-3.5 text-ifr-green shrink-0" />
                </a>
              </Link>
            ) : (
              <div className="flex items-center gap-2.5 p-3 border border-ifr rounded-ifr-sm shadow-sm">
                <div
                  className="shrink-0 flex items-center justify-center"
                  style={{
                    width: "32px",
                    height: "32px",
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
            )}
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

/** Collapsible DPP subsection with colored icon */
function DppSubsection({
  icon,
  iconBg,
  title,
  subtitle,
  children,
}: {
  icon: ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-ifr rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center w-full gap-3 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div
          className="flex items-center justify-center w-10 h-10 rounded-md shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xl font-bold" style={{ fontFamily: "var(--ifr-font-heading)" }}>
            {title}
          </h4>
          <p className="text-sm text-ifr-text-secondary">{subtitle}</p>
        </div>
        <ChevronDown
          size={20}
          className={`shrink-0 text-ifr-text-secondary transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <>
          <div className="border-t border-ifr mx-6" />
          <div className="px-6 py-4 flex flex-col gap-2">{children}</div>
        </>
      )}
    </div>
  );
}

/** Check if any of the given fields have values in the dpp object */
function hasAnyField(dpp: Record<string, any>, fields: string[]): boolean {
  return fields.some(f => dpp[f] !== undefined && dpp[f] !== null && dpp[f] !== "");
}

/** Sustainability metric card */
function MetricCard({
  icon,
  iconBg,
  label,
  value,
  unit,
}: {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: string | undefined;
  unit: string;
}) {
  if (!value) return null;
  return (
    <div className="bg-[rgba(200,212,229,0.1)] border border-[#c9cccf] rounded-md p-4 flex items-start gap-3">
      <div
        className="flex items-center justify-center w-10 h-10 rounded-md shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[#6c707c] m-0" style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}>
          {label}
        </p>
        <p
          className="text-[#0b1324] m-0"
          style={{
            fontFamily: "var(--ifr-font-body)",
            fontSize: "var(--ifr-fs-md)",
            fontWeight: "var(--ifr-fw-bold)",
          }}
        >
          {value} {unit}
        </p>
      </div>
    </div>
  );
}

/** Sustainability metric cards grid */
function SustainabilityMetrics({ dpp }: { dpp: Record<string, string> }) {
  const { t } = useTranslation("common");

  const leafIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66L12 14l4 4 6-6-2-2-4 4-3-3c2.74-5.07 5.91-7.5 9-7.5V2c-4.26 0-8.17 3.59-10 6"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const boltIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const metrics = [
    { label: t("Energy Consumption"), value: dpp.energyConsumption, unit: "kWh", icon: boltIcon, iconBg: "#A65F00" },
    { label: t("CO\u2082 Emissions"), value: dpp.co2eEmissions, unit: "kg", icon: leafIcon, iconBg: "#036A53" },
    { label: t("Water Consumption"), value: dpp.waterConsumption, unit: "L", icon: leafIcon, iconBg: "#036A53" },
    { label: t("Chemical Consumption"), value: dpp.chemicalConsumption, unit: "kg", icon: leafIcon, iconBg: "#036A53" },
  ].filter(m => m.value);

  if (metrics.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
      {metrics.map(m => (
        <MetricCard key={m.label} icon={m.icon} iconBg={m.iconBg} label={m.label} value={m.value} unit={m.unit} />
      ))}
    </div>
  );
}

/** Location card for Get It Made / Repair / Recycling */
function LocationCard({
  name,
  description,
  distance,
  type,
  verified,
}: {
  name: string;
  description?: string;
  distance?: string;
  type?: string;
  verified?: boolean;
}) {
  const { t } = useTranslation("common");
  return (
    <div className="border border-[#c9cccf] rounded-md p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p
            className="text-[#0b1324] m-0"
            style={{
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-md)",
              fontWeight: "var(--ifr-fw-medium)",
            }}
          >
            {name}
          </p>
          <div className="flex items-center gap-3">
            {distance && (
              <span className="flex items-center gap-1 text-[#036a53]" style={{ fontSize: "var(--ifr-fs-sm)" }}>
                <Location size={14} />
                {distance}
              </span>
            )}
            {type && (
              <span
                className="border border-[#c9cccf] rounded px-2 py-0.5 text-[#0b1324]"
                style={{
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-sm)",
                  fontWeight: "var(--ifr-fw-medium)",
                }}
              >
                {type}
              </span>
            )}
          </div>
        </div>
        {verified && (
          <span
            className="bg-[rgba(3,106,83,0.1)] text-[#036a53] rounded px-2 py-0.5 shrink-0"
            style={{
              fontFamily: "var(--ifr-font-body)",
              fontSize: "12px",
              fontWeight: "var(--ifr-fw-medium)",
            }}
          >
            {t("Verified")}
          </span>
        )}
      </div>
      {description && (
        <p className="text-[#6c707c] m-0" style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}>
          {description}
        </p>
      )}
    </div>
  );
}

/** Categorized DPP display with collapsible subsections */
function DppDisplay({ dpp }: { dpp: Record<string, string> }) {
  const { t } = useTranslation("common");

  const overviewFields = [
    "brandName",
    "productName",
    "countrySale",
    "countryOrigin",
    "dimensions",
    "modelName",
    "netWeight",
    "conditionProduct",
    "warrantyDuration",
  ];
  const complianceFields = ["ceMarking", "rohsCompliance"];
  const envFields = ["energyConsumption", "co2eEmissions", "waterConsumption", "chemicalConsumption"];
  const energyFields = [
    "maxPower",
    "maxVoltage",
    "maxCurrent",
    "batteryType",
    "batteryChargingTime",
    "batteryLife",
    "chargerType",
    "powerRating",
    "dcVoltage",
  ];
  const repairFields = ["sparePartsAvailability", "reasonForRepair", "performedAction", "materialsUsed"];

  return (
    <div className="flex flex-col gap-6">
      {/* Overview */}
      {hasAnyField(dpp, overviewFields) && (
        <DppSubsection
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect x="9" y="3" width="6" height="4" rx="1" stroke="white" strokeWidth="2" />
            </svg>
          }
          iconBg="#1447E6"
          title={t("DPP Overview")}
          subtitle={t("Basic product information and identification")}
        >
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
        </DppSubsection>
      )}

      {/* Compliance & Certifications */}
      {hasAnyField(dpp, complianceFields) && (
        <DppSubsection
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          iconBg="#0B1324"
          title={t("Compliance & Certifications")}
          subtitle={t("Regulatory compliance and standards")}
        >
          <DppFieldRow
            label={t("CE Marking")}
            value={dpp.ceMarking === "yes" ? t("Yes") : dpp.ceMarking === "no" ? t("No") : undefined}
          />
          <DppFieldRow
            label={t("ROHS Compliance")}
            value={dpp.rohsCompliance === "yes" ? t("Yes") : dpp.rohsCompliance === "no" ? t("No") : undefined}
          />
        </DppSubsection>
      )}

      {/* Environmental Impact */}
      {hasAnyField(dpp, envFields) && (
        <DppSubsection
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66L12 14l4 4 6-6-2-2-4 4-3-3c2.74-5.07 5.91-7.5 9-7.5V2c-4.26 0-8.17 3.59-10 6"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          iconBg="#036A53"
          title={t("Environmental Impact")}
          subtitle={t("Energy, emissions, and resource consumption")}
        >
          <DppFieldRow
            label={t("Energy Consumption")}
            value={dpp.energyConsumption ? `${dpp.energyConsumption} kWh` : undefined}
          />
          <DppFieldRow label={t("CO₂ Emissions")} value={dpp.co2eEmissions ? `${dpp.co2eEmissions} kg` : undefined} />
          <DppFieldRow
            label={t("Water Consumption")}
            value={dpp.waterConsumption ? `${dpp.waterConsumption} L` : undefined}
          />
          <DppFieldRow
            label={t("Chemical Consumption")}
            value={dpp.chemicalConsumption ? `${dpp.chemicalConsumption} kg` : undefined}
          />
        </DppSubsection>
      )}

      {/* Energy & Power */}
      {hasAnyField(dpp, energyFields) && (
        <DppSubsection
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          iconBg="#A65F00"
          title={t("Energy & Power")}
          subtitle={t("Power consumption and electrical specifications")}
        >
          <DppFieldRow label={t("Max Power")} value={dpp.maxPower ? `${dpp.maxPower} W` : undefined} />
          <DppFieldRow label={t("Max Voltage")} value={dpp.maxVoltage ? `${dpp.maxVoltage} V` : undefined} />
          <DppFieldRow label={t("Max Current")} value={dpp.maxCurrent ? `${dpp.maxCurrent} A` : undefined} />
          <DppFieldRow label={t("Battery Type")} value={dpp.batteryType} />
          <DppFieldRow
            label={t("Charging Time")}
            value={dpp.batteryChargingTime ? `${dpp.batteryChargingTime} min` : undefined}
          />
          <DppFieldRow label={t("Battery Life")} value={dpp.batteryLife ? `${dpp.batteryLife} min` : undefined} />
          <DppFieldRow label={t("Charger Type")} value={dpp.chargerType} />
          <DppFieldRow label={t("Power Rating")} value={dpp.powerRating ? `${dpp.powerRating} W` : undefined} />
          <DppFieldRow label={t("DC Voltage")} value={dpp.dcVoltage ? `${dpp.dcVoltage} V` : undefined} />
        </DppSubsection>
      )}

      {/* Repairability */}
      {hasAnyField(dpp, repairFields) && (
        <DppSubsection
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          iconBg="#8200DB"
          title={t("Repairability")}
          subtitle={t("Repair availability and spare parts")}
        >
          <DppFieldRow label={t("Spare Parts")} value={dpp.sparePartsAvailability} />
          <DppFieldRow label={t("Reason for Repair")} value={dpp.reasonForRepair} />
          <DppFieldRow label={t("Action Performed")} value={dpp.performedAction} />
          <DppFieldRow label={t("Materials Used")} value={dpp.materialsUsed} />
        </DppSubsection>
      )}
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

            {/* Sustainability Overview — products with DPP data */}
            {projectType === ProjectType.PRODUCT && (project.metadata as Record<string, any>)?.dpp && (
              <DetailSection
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66L12 14l4 4 6-6-2-2-4 4-3-3c2.74-5.07 5.91-7.5 9-7.5V2c-4.26 0-8.17 3.59-10 6"
                      stroke="#036A53"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
                iconBg="bg-[rgba(3,106,83,0.1)]"
                title={t("Sustainability Overview")}
                subtitle={t("Environmental impact and resource consumption metrics")}
                sectionId="sustainability"
              >
                <SustainabilityMetrics dpp={(project.metadata as Record<string, any>).dpp as Record<string, string>} />
              </DetailSection>
            )}

            {/* Get It Made — designs, shows manufacturers */}
            {projectType === ProjectType.DESIGN && (
              <DetailSection
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="7" height="7" rx="1" stroke="#0B1324" strokeWidth="2" />
                    <rect x="14" y="3" width="7" height="7" rx="1" stroke="#0B1324" strokeWidth="2" />
                    <rect x="3" y="14" width="7" height="7" rx="1" stroke="#0B1324" strokeWidth="2" />
                    <rect x="14" y="14" width="7" height="7" rx="1" stroke="#0B1324" strokeWidth="2" />
                  </svg>
                }
                iconBg="bg-[#f1bd4d]"
                title={t("Get It Made")}
                subtitle={t("Local manufacturers and makerspaces that can produce this")}
                sectionId="get-it-made"
              >
                <div className="flex flex-col gap-3">
                  <p
                    className="text-[#6c707c] m-0"
                    style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
                  >
                    {t("These verified manufacturers have the equipment and expertise to make this project for you:")}
                  </p>
                  <LocationCard
                    name="FabLab Hamburg"
                    distance="2.3 km"
                    type="Makerspace"
                    verified
                    description="Full equipment: Laser cutters, 3D printers, electronics lab."
                  />
                  <LocationCard
                    name="Precision 3D Shop"
                    distance="5.1 km"
                    type="Commercial"
                    verified
                    description="Full equipment: Laser cutters, 3D printers, electronics lab."
                  />
                  <LocationCard
                    name="Community Workshop"
                    distance="7.8 km"
                    type="Makerspace"
                    verified
                    description="Full equipment: Laser cutters, 3D printers, electronics lab."
                  />
                </div>
              </DetailSection>
            )}

            {/* Community Contributions */}
            <DetailSection
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                    stroke="#0B1324"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="9" cy="7" r="4" stroke="#0B1324" strokeWidth="2" />
                  <path
                    d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                    stroke="#0B1324"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              iconBg="bg-[rgba(200,212,229,0.5)]"
              title={t("Community Contributions")}
              subtitle={t("Improvements and modifications from contributors")}
              badge={
                (project.metadata as Record<string, any>)?.contributors?.length > 0 ? (
                  <span className="border border-[#c9cccf] rounded px-2 py-0.5 text-xs font-medium text-[#0b1324]">
                    {(project.metadata as Record<string, any>).contributors.length}
                  </span>
                ) : undefined
              }
              sectionId="contributions"
            >
              {(project.metadata as Record<string, any>)?.contributors?.length > 0 ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-4">
                    {((project.metadata as Record<string, any>).contributors as string[]).map((userId: string) => (
                      <Link key={userId} href={`/profile/${userId}`}>
                        <a className="flex flex-col items-center gap-2 no-underline group">
                          <BrUserAvatar userId={userId} size="48px" />
                          <span
                            className="text-[#0b1324] group-hover:underline"
                            style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
                          >
                            {userId.slice(0, 8)}
                          </span>
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <p
                  className="text-[#6c707c] m-0"
                  style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
                >
                  {t("Community contributions would be displayed here...")}
                </p>
              )}
            </DetailSection>

            {/* Related Projects */}
            <DetailSection
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <line x1="6" y1="3" x2="6" y2="15" stroke="#0B1324" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="18" cy="6" r="3" stroke="#0B1324" strokeWidth="2" />
                  <circle cx="6" cy="18" r="3" stroke="#0B1324" strokeWidth="2" />
                  <path
                    d="M18 9a9 9 0 01-9 9"
                    stroke="#0B1324"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              iconBg="bg-[rgba(200,212,229,0.5)]"
              title={t("Related Projects")}
              subtitle={t("Projects inspired by or building upon this design")}
              sectionId="related-projects"
            >
              <p
                className="text-[#6c707c] m-0"
                style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
              >
                {t("Related projects would be displayed here...")}
              </p>
            </DetailSection>

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
