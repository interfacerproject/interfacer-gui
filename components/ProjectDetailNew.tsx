// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { useQuery } from "@apollo/client";
import { ChevronDown, ChevronLeft, ChevronRight } from "@carbon/icons-react";
import { BookmarkIcon, ExternalLinkIcon, StarIcon } from "@heroicons/react/outline";
import BrUserAvatar from "components/brickroom/BrUserAvatar";
import DetailMap from "components/DetailMap";
import DetailSection from "components/DetailSection";
import EntityTypeIcon from "components/EntityTypeIcon";
import { useProject } from "components/layout/FetchProjectLayout";
import ProjectCardImage from "components/ProjectCardImage";
import ProjectsCards from "components/ProjectsCards";
import { ProjectType } from "components/types";
import { useAuth } from "hooks/useAuth";

import { SEARCH_PROJECT } from "components/ProjectDisplay";
import useDppApi from "lib/dpp";
import type { DppDocument } from "lib/dpp-types";
import findProjectImages from "lib/findProjectImages";
import { isProjectType } from "lib/isProjectType";
import MdParser from "lib/MdParser";

import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useMemo, useState } from "react";

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
  const color = typeColors[projectType] || "var(--ifr-green)";

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
  const basedOnDesignMeta = meta.basedOnDesign as { id?: string; name?: string } | string | undefined;
  const designId = basedOnDesignMeta
    ? typeof basedOnDesignMeta === "object"
      ? basedOnDesignMeta.id
      : undefined
    : (meta.design as string | undefined);

  // Resolve design name when we only have an ID from metadata.design
  const { data: designData } = useQuery(SEARCH_PROJECT, {
    variables: { id: designId! },
    skip: !designId || (typeof basedOnDesignMeta === "object" && !!basedOnDesignMeta.name),
  });

  const basedOnDesign = basedOnDesignMeta
    ? basedOnDesignMeta
    : designId
    ? { id: designId, name: designData?.economicResource?.name || undefined }
    : undefined;

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
        </div>

        {/* Created by / Manufactured by */}
        {project.primaryAccountable && (
          <div>
            <p
              className="text-ifr-text-secondary mb-2"
              style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
            >
              {projectType === ProjectType.PRODUCT ? t("Manufactured by") : t("Created by")}
            </p>
            <Link href={`/profile/${project.primaryAccountable.id}`}>
              <a className="flex items-center gap-3 p-3 border border-ifr rounded-ifr-sm no-underline group hover:bg-ifr-hover transition-colors">
                <BrUserAvatar userId={project.primaryAccountable.id} size="40px" />
                <div className="flex-1 min-w-0">
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
                    <p className="flex items-center gap-1 mt-0.5" style={{ fontSize: "var(--ifr-fs-sm)" }}>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="shrink-0"
                        style={{ color: "var(--ifr-green)" }}
                      >
                        <path
                          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
                          fill="currentColor"
                        />
                      </svg>
                      <span style={{ color: "var(--ifr-green)", fontFamily: "var(--ifr-font-body)" }}>
                        {project.primaryAccountable.primaryLocation.name}
                      </span>
                    </p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-ifr-text-secondary shrink-0" />
              </a>
            </Link>
          </div>
        )}

        {/* Divider */}
        {project.primaryAccountable && (
          <div className="w-full" style={{ height: "1px", backgroundColor: "var(--ifr-border)" }} />
        )}

        {/* Based on design — products only */}
        {projectType === ProjectType.PRODUCT && basedOnDesign && (
          <div>
            <p
              className="text-ifr-text-secondary mb-2"
              style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
            >
              {t("Based on open source design")}
            </p>
            {typeof basedOnDesign === "object" && basedOnDesign.id ? (
              <Link href={`/project/${basedOnDesign.id}`}>
                <a className="flex items-center gap-2.5 p-3 border border-ifr rounded-ifr-sm hover:bg-ifr-hover transition-colors no-underline">
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
              <div className="flex items-center gap-2.5 p-3 border border-ifr rounded-ifr-sm">
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

        {/* Divider */}
        <div className="w-full" style={{ height: "1px", backgroundColor: "var(--ifr-border)" }} />

        {/* Save + Watch */}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            className="w-full flex items-center gap-2 px-1 py-1.5 bg-transparent border-none cursor-pointer hover:bg-ifr-hover transition-colors"
            style={{ borderRadius: "var(--ifr-radius-sm)" }}
          >
            <BookmarkIcon className="w-4 h-4 text-ifr-text-secondary" />
            <span
              className="text-ifr-text-secondary"
              style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)" }}
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
              style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)" }}
            >
              {t("Watch Project")}
            </span>
          </button>
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

/** Card for a single DPP in the Digital Product Passports list. */
function DppListCard({ dpp, index, color }: { dpp: DppDocument; index: number; color: string }) {
  const { t } = useTranslation("common");
  const [expanded, setExpanded] = useState(false);

  const label = dpp.productOverview?.productName?.value || `DPP-${String(index + 1).padStart(3, "0")}`;
  const batchLabel = dpp.batchType === "unit" ? t("Unit") : t("Batch");
  const dateStr = dpp.createdAt
    ? new Date(dpp.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "";

  return (
    <div className="border border-ifr rounded-ifr-md overflow-hidden bg-ifr-surface">
      <div className="flex items-center gap-3 p-4">
        {/* DPP icon */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 40,
            height: 40,
            borderRadius: "var(--ifr-radius-sm)",
            backgroundColor: "rgba(200,212,229,0.3)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="9" y="3" width="6" height="4" rx="1" stroke={color} strokeWidth="2" />
          </svg>
        </div>

        {/* Name + batch + serial + date */}
        <div className="flex-1 min-w-0">
          <p
            className="m-0 text-ifr-text-primary truncate"
            style={{
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-md)",
              fontWeight: "var(--ifr-fw-semibold)",
            }}
          >
            {label}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className="px-1.5 py-0.5 rounded text-xs"
              style={{
                backgroundColor: dpp.batchType === "unit" ? "rgba(3,106,83,0.1)" : "rgba(130,0,219,0.1)",
                color: dpp.batchType === "unit" ? "#036A53" : "#8200DB",
                fontWeight: "var(--ifr-fw-medium)",
              }}
            >
              {batchLabel}
            </span>
            {dpp.batchId && (
              <span className="text-ifr-text-secondary font-mono" style={{ fontSize: "var(--ifr-fs-xs)" }}>
                {dpp.batchId}
              </span>
            )}
            {dateStr && (
              <span className="text-ifr-text-secondary" style={{ fontSize: "var(--ifr-fs-xs)" }}>
                {t("Published")} {dateStr}
              </span>
            )}
          </div>
        </div>

        {/* View DPP button */}
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="shrink-0 px-3 py-1.5 bg-transparent border border-ifr hover:bg-ifr-hover transition-colors cursor-pointer"
          style={{
            borderRadius: "var(--ifr-radius-sm)",
            fontFamily: "var(--ifr-font-body)",
            fontSize: "var(--ifr-fs-xs)",
            fontWeight: "var(--ifr-fw-medium)",
            color: "var(--ifr-text-primary)",
          }}
        >
          {expanded ? t("Hide DPP") : t("View DPP")}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-ifr p-4 bg-white">
          <DppDocumentDetail dpp={dpp} />
        </div>
      )}
    </div>
  );
}

/** Renders DPP document fields in a readable format. */
function DppDocumentDetail({ dpp }: { dpp: DppDocument }) {
  const { t } = useTranslation("common");

  const sections: { title: string; fields: { label: string; value: any }[] }[] = [];

  // Product Overview
  if (dpp.productOverview) {
    const po = dpp.productOverview;
    const fields = [
      { label: t("Brand"), value: po.brandName?.value },
      { label: t("Product Name"), value: po.productName?.value },
      { label: t("Description"), value: po.productDescription?.value },
      { label: t("Model"), value: po.modelName?.value },
      { label: t("GTIN"), value: po.gtin?.value },
      { label: t("Country of Origin"), value: po.countryOfOrigin?.value },
      { label: t("Country of Sale"), value: po.countryOfSale?.value },
      { label: t("Color"), value: po.color?.value },
      { label: t("Dimensions"), value: po.dimensions?.value },
      { label: t("Net Weight"), value: po.netWeight?.value },
      { label: t("Condition"), value: po.conditionOfTheProduct?.value },
      { label: t("Warranty"), value: po.warrantyDuration?.value },
    ].filter(f => f.value != null && f.value !== "");
    if (fields.length > 0) sections.push({ title: t("Product Overview"), fields });
  }

  // Compliance
  if (dpp.complianceAndStandards) {
    const cs = dpp.complianceAndStandards;
    const fields = [
      { label: t("CE Marking"), value: cs.ceMarking?.value },
      { label: t("RoHS Compliance"), value: cs.rohsCompliance?.value },
    ].filter(f => f.value != null && f.value !== "");
    if (fields.length > 0) sections.push({ title: t("Compliance & Standards"), fields });
  }

  // Environmental Impact
  if (dpp.environmentalImpact) {
    const ei = dpp.environmentalImpact;
    const fields = [
      {
        label: t("Energy Consumption"),
        value: ei.energyConsumptionPerUnit?.value,
        units: ei.energyConsumptionPerUnit?.units,
      },
      { label: t("CO₂ Emissions"), value: ei.co2eEmissionsPerUnit?.value, units: ei.co2eEmissionsPerUnit?.units },
      {
        label: t("Water Consumption"),
        value: ei.waterConsumptionPerUnit?.value,
        units: ei.waterConsumptionPerUnit?.units,
      },
      {
        label: t("Chemical Consumption"),
        value: ei.chemicalConsumptionPerUnit?.value,
        units: ei.chemicalConsumptionPerUnit?.units,
      },
    ].filter(f => f.value != null && String(f.value) !== "");
    if (fields.length > 0) sections.push({ title: t("Environmental Impact"), fields });
  }

  // Energy Use
  if (dpp.energyUseAndEfficiency) {
    const eu = dpp.energyUseAndEfficiency;
    const fields = [
      { label: t("Battery Type"), value: eu.batteryType?.value },
      { label: t("Power Rating"), value: eu.powerRating?.value, units: eu.powerRating?.units },
      { label: t("Max Voltage"), value: eu.maximumVoltage?.value, units: eu.maximumVoltage?.units },
      { label: t("Battery Life"), value: eu.batteryLife?.value, units: eu.batteryLife?.units },
    ].filter(f => f.value != null && f.value !== "");
    if (fields.length > 0) sections.push({ title: t("Energy Use & Efficiency"), fields });
  }

  // Reparability
  if (dpp.reparability) {
    const r = dpp.reparability;
    const fields = [
      { label: t("Service & Repair Instructions"), value: r.serviceAndRepairInstructions?.value },
      { label: t("Spare Parts Availability"), value: r.availabilityOfSpareParts?.value },
    ].filter(f => f.value != null && f.value !== "");
    if (fields.length > 0) sections.push({ title: t("Reparability"), fields });
  }

  // Recyclability
  if (dpp.recyclability) {
    const rc = dpp.recyclability;
    const fields = [
      { label: t("Recycling Instructions"), value: rc.recyclingInstructions?.value },
      { label: t("Material Composition"), value: rc.materialComposition?.value },
      { label: t("Substances of Concern"), value: rc.substancesOfConcern?.value },
    ].filter(f => f.value != null && f.value !== "");
    if (fields.length > 0) sections.push({ title: t("Recyclability"), fields });
  }

  if (sections.length === 0) {
    return (
      <p className="text-[#6c707c] m-0" style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}>
        {t("No detailed data available for this passport.")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {sections.map(s => (
        <div key={s.title}>
          <h4
            className="m-0 mb-2 text-ifr-text-primary"
            style={{
              fontFamily: "var(--ifr-font-heading)",
              fontSize: "var(--ifr-fs-sm)",
              fontWeight: "var(--ifr-fw-semibold)",
            }}
          >
            {s.title}
          </h4>
          <div className="flex flex-col gap-1">
            {s.fields.map(f => (
              <div key={f.label} className="flex justify-between py-1 border-b border-[#f0f0f0] last:border-0">
                <span className="text-[#6c707c]" style={{ fontSize: "var(--ifr-fs-sm)" }}>
                  {f.label}
                </span>
                <span
                  className="text-ifr-text-primary text-right"
                  style={{ fontSize: "var(--ifr-fs-sm)", fontWeight: "var(--ifr-fw-medium)" }}
                >
                  {String(f.value)}
                  {(f as any).units ? ` ${(f as any).units}` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Banner showing this product was manufactured from an open source design */
function DesignBanner({ designId, designName }: { designId?: string; designName?: string }) {
  const { t } = useTranslation("common");
  const { data } = useQuery(SEARCH_PROJECT, {
    variables: { id: designId! },
    skip: !designId || !!designName,
  });
  const name = designName || data?.economicResource?.name || t("Design");
  const author = data?.economicResource?.primaryAccountable?.name;

  return (
    <div
      className="flex items-center gap-3 p-4 rounded-ifr-md mt-4"
      style={{ backgroundColor: "rgba(3,106,83,0.08)", border: "1px solid rgba(3,106,83,0.2)" }}
    >
      <div
        className="shrink-0 flex items-center justify-center"
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "var(--ifr-radius-sm)",
          backgroundColor: "var(--ifr-green)",
        }}
      >
        <EntityTypeIcon type={ProjectType.DESIGN} size="small" fill="#ffffff" />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="m-0 text-[#036A53]"
          style={{
            fontFamily: "var(--ifr-font-body)",
            fontSize: "var(--ifr-fs-sm)",
            fontWeight: "var(--ifr-fw-semibold)",
          }}
        >
          {t("Manufactured from open source design")}
        </p>
        <p className="m-0 text-[#036A53]" style={{ fontSize: "var(--ifr-fs-xs)", opacity: 0.8 }}>
          {t("Based on")} <span style={{ fontWeight: "var(--ifr-fw-semibold)" }}>{name}</span>
          {author && (
            <>
              {" "}
              {/* eslint-disable-next-line i18next/no-literal-string */}
              {t("by")}: {author}
            </>
          )}
        </p>
      </div>
      {designId && (
        <Link href={`/project/${designId}`}>
          <a
            className="flex items-center gap-1 px-3 py-1.5 rounded-ifr-sm no-underline shrink-0"
            style={{
              backgroundColor: "#036A53",
              color: "#fff",
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-sm)",
              fontWeight: "var(--ifr-fw-medium)",
            }}
          >
            {t("View Design")}
            <ExternalLinkIcon className="w-4 h-4" />
          </a>
        </Link>
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

  // Fetch DPPs from interfacer-dpp API
  const dppApi = useDppApi();
  const [productDpps, setProductDpps] = useState<DppDocument[]>([]);
  const [dppsLoading, setDppsLoading] = useState(false);

  useEffect(() => {
    if (projectType !== ProjectType.PRODUCT || !project.id) return;
    let cancelled = false;
    setDppsLoading(true);
    dppApi
      .listDpps({ productId: project.id })
      .then(res => {
        if (!cancelled) setProductDpps(res.dpps || []);
      })
      .catch(() => {
        if (!cancelled) setProductDpps([]);
      })
      .finally(() => {
        if (!cancelled) setDppsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id, projectType]);

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
                {projectType === ProjectType.PRODUCT && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white shrink-0"
                    style={{ backgroundColor: "#036A53", fontSize: "var(--ifr-fs-xs)", fontWeight: 600 }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {t("Available")}
                  </span>
                )}
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

          {/* Manufactured from open source design banner */}
          {projectType === ProjectType.PRODUCT &&
            (() => {
              const meta = (project.metadata || {}) as Record<string, any>;
              const basedOn = meta.basedOnDesign as { id?: string; name?: string } | string | undefined;
              const fallbackDesignId = meta.design as string | undefined;
              const resolvedDesignId = basedOn
                ? typeof basedOn === "object"
                  ? basedOn.id
                  : undefined
                : fallbackDesignId;
              const resolvedDesignName = basedOn
                ? typeof basedOn === "object"
                  ? basedOn.name || t("Design")
                  : String(basedOn)
                : undefined;
              if (!basedOn && !fallbackDesignId) return null;
              return <DesignBanner designId={resolvedDesignId} designName={resolvedDesignName} />;
            })()}

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
                {projectType === ProjectType.PRODUCT &&
                  (() => {
                    const meta = (project.metadata || {}) as Record<string, any>;
                    const basedOnDesign = meta.basedOnDesign as { id?: string; name?: string } | string | undefined;
                    return (
                      basedOnDesign &&
                      typeof basedOnDesign === "object" &&
                      basedOnDesign.id && (
                        <p
                          className="text-[#6c707c] m-0 mt-3"
                          style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-xs)" }}
                        >
                          {t("Materials are inherited from the parent Design.")}{" "}
                          <Link href={`/project/${basedOnDesign.id}#bom`}>
                            <a className="text-[#036A53] underline hover:no-underline">
                              {t("See the full bill of materials")}
                            </a>
                          </Link>
                        </p>
                      )
                    );
                  })()}
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
                  {project.currentLocation.lat != null && project.currentLocation.long != null && (
                    <div className="mt-2 rounded-lg overflow-hidden">
                      <DetailMap location={project.currentLocation} height={250} />
                    </div>
                  )}
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
                {/* Recyclable / Repairable badges */}
                {productDpps.length > 0 &&
                  (() => {
                    const dpp = productDpps[0];
                    const hasRecyclability =
                      dpp.recyclability &&
                      (dpp.recyclability.recyclingInstructions?.value || dpp.recyclability.materialComposition?.value);
                    const hasReparability =
                      dpp.reparability &&
                      (dpp.reparability.serviceAndRepairInstructions?.value ||
                        dpp.reparability.availabilityOfSpareParts?.value);
                    if (!hasRecyclability && !hasReparability) return null;
                    return (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {hasRecyclability && (
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white"
                            style={{ backgroundColor: "#036A53", fontSize: "var(--ifr-fs-xs)", fontWeight: 600 }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M7 19H4.815a1.83 1.83 0 01-1.57-.881 1.785 1.785 0 01-.004-1.784L7.196 9.5"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M11 19h8.203a1.83 1.83 0 001.556-.89 1.784 1.784 0 00-.005-1.78L16.8 9.5"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M12 5l3.962 6.343M8.038 11.343L12 5"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            {t("Recyclable")}
                          </span>
                        )}
                        {hasReparability && (
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white"
                            style={{ backgroundColor: "#036A53", fontSize: "var(--ifr-fs-xs)", fontWeight: 600 }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            {t("Repairable")}
                          </span>
                        )}
                      </div>
                    );
                  })()}
              </DetailSection>
            )}

            {/* Recycling Information — from DPP data */}
            {projectType === ProjectType.PRODUCT &&
              productDpps.length > 0 &&
              (() => {
                const dpp = productDpps[0];
                const rc = dpp.recyclability;
                if (!rc) return null;
                const hasContent =
                  rc.recyclingInstructions?.value || rc.materialComposition?.value || rc.substancesOfConcern?.value;
                if (!hasContent) return null;
                return (
                  <DetailSection
                    icon={
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M7 19H4.815a1.83 1.83 0 01-1.57-.881 1.785 1.785 0 01-.004-1.784L7.196 9.5"
                          stroke="#036A53"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M11 19h8.203a1.83 1.83 0 001.556-.89 1.784 1.784 0 00-.005-1.78L16.8 9.5"
                          stroke="#036A53"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 5l3.962 6.343M8.038 11.343L12 5"
                          stroke="#036A53"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                    iconBg="bg-[rgba(3,106,83,0.1)]"
                    title={t("Recycling Information")}
                    subtitle={t("How to recycle this product")}
                    sectionId="recycling"
                  >
                    <div className="flex flex-col gap-3">
                      {rc.recyclingInstructions?.value && (
                        <p
                          className="text-ifr-text-primary m-0"
                          style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
                        >
                          {String(rc.recyclingInstructions.value)}
                        </p>
                      )}
                      {rc.materialComposition?.value && (
                        <div>
                          <p
                            className="text-[#6c707c] m-0 mb-1"
                            style={{ fontSize: "var(--ifr-fs-xs)", fontWeight: "var(--ifr-fw-semibold)" }}
                          >
                            {t("Material Composition")}
                          </p>
                          <p
                            className="text-ifr-text-primary m-0"
                            style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
                          >
                            {String(rc.materialComposition.value)}
                          </p>
                        </div>
                      )}
                      {rc.substancesOfConcern?.value && (
                        <div>
                          <p
                            className="text-[#6c707c] m-0 mb-1"
                            style={{ fontSize: "var(--ifr-fs-xs)", fontWeight: "var(--ifr-fw-semibold)" }}
                          >
                            {t("Substances of Concern")}
                          </p>
                          <p
                            className="text-ifr-text-primary m-0"
                            style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
                          >
                            {String(rc.substancesOfConcern.value)}
                          </p>
                        </div>
                      )}
                    </div>
                  </DetailSection>
                );
              })()}

            {/* Repair Information — from DPP data */}
            {projectType === ProjectType.PRODUCT &&
              productDpps.length > 0 &&
              (() => {
                const dpp = productDpps[0];
                const rep = dpp.reparability;
                const ri = dpp.repairInformation;
                const hasRep = rep?.serviceAndRepairInstructions?.value || rep?.availabilityOfSpareParts?.value;
                const hasRi = ri?.reasonForRepair?.value || ri?.performedAction?.value || ri?.materialsUsed?.value;
                if (!hasRep && !hasRi) return null;
                return (
                  <DetailSection
                    icon={
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                          stroke="#8200DB"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                    iconBg="bg-[rgba(130,0,219,0.1)]"
                    title={t("Repair Information")}
                    subtitle={t("How to repair this product")}
                    sectionId="repair"
                  >
                    <div className="flex flex-col gap-3">
                      {rep?.serviceAndRepairInstructions?.value && (
                        <p
                          className="text-ifr-text-primary m-0"
                          style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
                        >
                          {String(rep.serviceAndRepairInstructions.value)}
                        </p>
                      )}
                      {rep?.availabilityOfSpareParts?.value && (
                        <div>
                          <p
                            className="text-[#6c707c] m-0 mb-1"
                            style={{ fontSize: "var(--ifr-fs-xs)", fontWeight: "var(--ifr-fw-semibold)" }}
                          >
                            {t("Spare Parts Availability")}
                          </p>
                          <p
                            className="text-ifr-text-primary m-0"
                            style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
                          >
                            {String(rep.availabilityOfSpareParts.value)}
                          </p>
                        </div>
                      )}
                      {ri?.performedAction?.value && (
                        <div>
                          <p
                            className="text-[#6c707c] m-0 mb-1"
                            style={{ fontSize: "var(--ifr-fs-xs)", fontWeight: "var(--ifr-fw-semibold)" }}
                          >
                            {t("Repair Actions")}
                          </p>
                          <p
                            className="text-ifr-text-primary m-0"
                            style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
                          >
                            {String(ri.performedAction.value)}
                          </p>
                        </div>
                      )}
                    </div>
                  </DetailSection>
                );
              })()}

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
                <p
                  className="text-[#6c707c] m-0"
                  style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
                >
                  {t("Manufacturer listings will be available soon. Contact the designer for production enquiries.")}
                </p>
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

            {/* Included Projects — sub-assemblies from metadata.relations */}
            {(() => {
              const relations = (project.metadata as Record<string, any>)?.relations;
              if (!relations || !Array.isArray(relations) || relations.length === 0) return null;
              return (
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
                  title={`${t("Included Projects")} (${relations.length})`}
                  subtitle={t("Sub-assemblies and components used in this project")}
                  sectionId="included-projects"
                >
                  <ProjectsCards
                    filter={{ id: relations }}
                    tiny
                    hideHeader
                    hidePagination
                    hideFilters
                    emptyState={
                      <p
                        className="text-[#6c707c] m-0"
                        style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
                      >
                        {t("No related projects found.")}
                      </p>
                    }
                  />
                </DetailSection>
              );
            })()}

            {/* Product Passport — embedded metadata (legacy) */}
            {projectType === ProjectType.PRODUCT &&
              (project.metadata as Record<string, any>)?.dpp &&
              productDpps.length === 0 && (
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

            {/* Digital Product Passports — fetched from interfacer-dpp API */}
            {projectType === ProjectType.PRODUCT && (productDpps.length > 0 || dppsLoading) && (
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
                title={t("Digital Product Passports")}
                subtitle={t("Traceability records for individual batches and units of this product")}
                badge={
                  productDpps.length > 0 ? (
                    <span className="border border-[#c9cccf] rounded px-2 py-0.5 text-xs font-medium text-[#0b1324]">
                      {productDpps.length}
                    </span>
                  ) : undefined
                }
                sectionId="digital-product-passports"
                defaultOpen
              >
                {dppsLoading ? (
                  <p
                    className="text-[#6c707c] m-0"
                    style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
                  >
                    {t("Loading product passports...")}
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {productDpps.map((dpp, idx) => (
                      <DppListCard key={dpp.id} dpp={dpp} index={idx} color={color} />
                    ))}
                  </div>
                )}
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
