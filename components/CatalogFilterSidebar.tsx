// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { Chemistry, Cube, Flash, LocationStar, Recycle, Settings, Tag, Time, Tools } from "@carbon/icons-react";
import { ScaleIcon } from "@heroicons/react/outline";
import CheckboxFilter from "components/CheckboxFilter";
import FilterSection from "components/FilterSection";
import ToggleSwitch from "components/ToggleSwitch";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";

export type CatalogVariant = "designs" | "products" | "services";

interface CatalogFilterSidebarProps {
  variant: CatalogVariant;
  collapsed?: boolean;
  onToggle?: () => void;
}

/** Decode machine/material/license slugs from URL tags */
function decodeSlugs(tags: string[], prefix: string): string[] {
  return tags
    .filter(t => t.startsWith(prefix))
    .map(t =>
      t
        .slice(prefix.length)
        .split("-")
        .filter(Boolean)
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ")
    );
}

function encodeSlugs(items: string[], prefix: string): string[] {
  return items.map(i => prefix + i.toLowerCase().replace(/\s+/g, "-"));
}

const MACHINES = [
  "3D Printer",
  "CNC Mill",
  "Laser Cutter",
  "PCB Mill",
  "Vinyl Cutter",
  "Embroidery Machine",
  "Soldering Iron",
  "Router",
  "Drill Press",
  "Band Saw",
  "Lathe",
  "Waterjet Cutter",
];

const MATERIALS = [
  "PLA",
  "ABS",
  "PETG",
  "Aluminum",
  "Steel",
  "Wood",
  "Acrylic",
  "Plywood",
  "Carbon Fiber",
  "Copper",
  "FR4 (PCB)",
  "Resin",
  "Nylon",
  "TPU",
];

const LICENSES = [
  "CERN-OHL-S v2",
  "CERN-OHL-W v2",
  "CERN-OHL-P v2",
  "CC BY 4.0",
  "CC BY-SA 4.0",
  "CC BY-NC 4.0",
  "MIT",
  "GPL v3",
  "Apache 2.0",
];

const SERVICE_TYPES = ["Fabrication", "Learning & Education", "Space Access"];

const CATEGORIES = [
  "3D printing",
  "Electronics",
  "Robotics",
  "Tools",
  "Furniture",
  "Home Automation",
  "Wearables",
  "Medical",
  "Education",
  "Sustainability",
];

export default function CatalogFilterSidebar({ variant, collapsed = false, onToggle }: CatalogFilterSidebarProps) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [manufacturingFilter, setManufacturingFilter] = useState("all");
  const [repairInfo, setRepairInfo] = useState(false);

  // Parse current tags from URL
  const currentTags = useMemo(() => {
    const t = router.query.tags;
    if (!t) return [] as string[];
    return typeof t === "string" ? t.split(",") : (t as string[]);
  }, [router.query.tags]);

  const selectedMachines = useMemo(() => decodeSlugs(currentTags, "machine-"), [currentTags]);
  const selectedMaterials = useMemo(() => decodeSlugs(currentTags, "material-"), [currentTags]);

  // Toggle a tag in the URL
  const toggleTag = useCallback(
    (prefix: string) => (item: string) => {
      const encoded = prefix + item.toLowerCase().replace(/\s+/g, "-");
      const newTags = currentTags.includes(encoded)
        ? currentTags.filter(t => t !== encoded)
        : [...currentTags, encoded];

      const query = { ...router.query };
      if (newTags.length > 0) {
        query.tags = newTags.join(",");
      } else {
        delete query.tags;
      }
      router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
    },
    [currentTags, router]
  );

  const toggleCategory = useCallback(
    (cat: string) => {
      const encoded = "category-" + cat.toLowerCase().replace(/\s+/g, "-");
      const newTags = currentTags.includes(encoded)
        ? currentTags.filter(t => t !== encoded)
        : [...currentTags, encoded];

      const query = { ...router.query };
      if (newTags.length > 0) {
        query.tags = newTags.join(",");
      } else {
        delete query.tags;
      }
      router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
    },
    [currentTags, router]
  );

  const selectedCategories = useMemo(() => decodeSlugs(currentTags, "category-"), [currentTags]);

  const clearAllFilters = () => {
    router.push({ pathname: router.pathname }, undefined, { shallow: true });
  };

  const hasActiveFilters = currentTags.length > 0 || !!router.query.q;

  return (
    <div
      className="bg-ifr-surface border-r border-ifr h-full shrink-0 relative"
      style={{
        width: collapsed ? "0px" : "var(--ifr-sidebar-width)",
        overflow: "hidden",
        transition: "width 250ms ease",
        borderRightWidth: collapsed ? "0px" : undefined,
      }}
    >
      <div
        className="h-full overflow-y-auto"
        style={{
          width: "var(--ifr-sidebar-width)",
          opacity: collapsed ? 0 : 1,
          transition: "opacity 200ms ease",
          pointerEvents: collapsed ? "none" : undefined,
        }}
      >
        {/* Header */}
        <div className="border-b border-ifr px-6 py-4">
          <p
            className="text-ifr-text-primary"
            style={{
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-md)",
              fontWeight: "var(--ifr-fw-medium)",
            }}
          >
            {t("Filter by")}
          </p>
        </div>

        {/* DESIGNS variant */}
        {variant === "designs" && (
          <>
            <FilterSection
              icon={<Settings size={16} />}
              label="Machines Needed"
              defaultOpen
              badge={selectedMachines.length || undefined}
            >
              <CheckboxFilter
                items={MACHINES}
                searchPlaceholder="Search machines..."
                selectedItems={selectedMachines}
                onToggle={toggleTag("machine-")}
              />
            </FilterSection>

            <FilterSection
              icon={<Cube size={16} />}
              label="Materials Needed"
              badge={selectedMaterials.length || undefined}
            >
              <CheckboxFilter
                items={MATERIALS}
                searchPlaceholder="Search materials..."
                selectedItems={selectedMaterials}
                onToggle={toggleTag("material-")}
              />
            </FilterSection>

            <FilterSection icon={<ScaleIcon className="w-4 h-4" />} label="License">
              <CheckboxFilter items={LICENSES} searchPlaceholder="Search licenses..." />
            </FilterSection>

            <FilterSection
              icon={<Tools size={16} />}
              label="Manufacturability"
              defaultOpen
              badge={manufacturingFilter !== "all" ? 1 : undefined}
            >
              <div className="flex flex-col gap-2.5">
                {[
                  { value: "all", label: "All" },
                  { value: "can_be_manufactured", label: "Can be manufactured" },
                  { value: "in_progress", label: "In progress" },
                ].map(option => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <div
                      className="w-4 h-4 border shrink-0 flex items-center justify-center transition-colors"
                      style={{
                        borderRadius: "50%",
                        backgroundColor:
                          manufacturingFilter === option.value ? "var(--ifr-green)" : "var(--ifr-bg-surface)",
                        borderColor: manufacturingFilter === option.value ? "var(--ifr-green)" : "var(--ifr-border)",
                      }}
                      onClick={() => setManufacturingFilter(option.value)}
                    >
                      {manufacturingFilter === option.value && (
                        <div className="w-1.5 h-1.5 bg-white" style={{ borderRadius: "50%" }} />
                      )}
                    </div>
                    <span
                      className="text-ifr-text-primary"
                      style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)" }}
                    >
                      {t(option.label)}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>
          </>
        )}

        {/* PRODUCTS variant */}
        {variant === "products" && (
          <>
            <FilterSection
              icon={<Cube size={16} />}
              label="Materials"
              defaultOpen
              badge={selectedMaterials.length || undefined}
            >
              <CheckboxFilter
                items={MATERIALS}
                searchPlaceholder="Search materials..."
                selectedItems={selectedMaterials}
                onToggle={toggleTag("material-")}
              />
            </FilterSection>

            <FilterSection icon={<Flash size={16} />} label="Power Requirement">
              <div className="flex flex-col gap-2">
                <div className="relative h-4">
                  <div className="absolute inset-0 bg-ifr-green rounded-full" />
                  <div className="absolute left-0 top-0 w-4 h-4 bg-white border border-ifr-green rounded-full shadow-sm" />
                  <div className="absolute right-0 top-0 w-4 h-4 bg-white border border-ifr-green rounded-full shadow-sm" />
                </div>
                <div className="flex justify-between">
                  <span
                    className="text-ifr-text-secondary"
                    style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
                  >
                    {"0W"}
                  </span>
                  <span
                    className="text-ifr-text-secondary"
                    style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
                  >
                    {"2000W"}
                  </span>
                </div>
              </div>
            </FilterSection>

            <FilterSection icon={<Tools size={16} />} label="Repairability">
              <ToggleSwitch
                label={t("Repair Info Available")}
                description={t("Projects with repair and maintenance info")}
                checked={repairInfo}
                onChange={setRepairInfo}
              />
            </FilterSection>
          </>
        )}

        {/* SERVICES variant */}
        {variant === "services" && (
          <>
            <FilterSection icon={<LocationStar size={16} />} label="Location" defaultOpen>
              <div className="flex flex-col gap-2">
                <label
                  className="text-ifr-text-primary"
                  style={{
                    fontFamily: "var(--ifr-font-body)",
                    fontSize: "var(--ifr-fs-sm)",
                    fontWeight: "var(--ifr-fw-medium)",
                  }}
                >
                  {t("City or Address")}
                </label>
                <input
                  type="text"
                  placeholder={t("Enter your location...")}
                  className="px-3 bg-ifr-form-input border border-ifr-form-input rounded-ifr-sm outline-none focus:border-ifr-green"
                  style={{
                    height: "var(--ifr-control-height)",
                    fontFamily: "var(--ifr-font-body)",
                    fontSize: "var(--ifr-fs-base)",
                  }}
                />
              </div>
            </FilterSection>

            <FilterSection icon={<Chemistry size={16} />} label="Service Type" defaultOpen>
              <CheckboxFilter items={SERVICE_TYPES} />
            </FilterSection>

            <FilterSection icon={<Time size={16} />} label="Availability">
              <CheckboxFilter items={["Available Now", "Booking Required", "Weekdays Only", "Weekends Available"]} />
            </FilterSection>

            <FilterSection
              icon={<Settings size={16} />}
              label="Machines Available"
              badge={selectedMachines.length || undefined}
            >
              <CheckboxFilter
                items={MACHINES}
                searchPlaceholder="Search machines..."
                selectedItems={selectedMachines}
                onToggle={toggleTag("machine-")}
              />
            </FilterSection>
          </>
        )}

        {/* Shared sections */}

        {/* Location — designs and products only */}
        {variant !== "services" && (
          <FilterSection icon={<LocationStar size={16} />} label="Location">
            <div className="flex flex-col gap-2">
              <label
                className="text-ifr-text-primary"
                style={{
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-sm)",
                  fontWeight: "var(--ifr-fw-medium)",
                }}
              >
                {t("City or Address")}
              </label>
              <input
                type="text"
                placeholder={t("Enter location...")}
                className="px-3 bg-ifr-form-input border border-ifr-form-input rounded-ifr-sm outline-none focus:border-ifr-green"
                style={{
                  height: "var(--ifr-control-height)",
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-base)",
                }}
              />
            </div>
          </FilterSection>
        )}

        <FilterSection icon={<Tag size={16} />} label="Categories & Tags">
          <div className="flex flex-col gap-2 max-h-[216px] overflow-y-auto pr-3">
            {CATEGORIES.map(cat => {
              const active = selectedCategories.map(c => c.toLowerCase()).includes(cat.toLowerCase());
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`text-left px-3 py-2 rounded-ifr-sm transition-colors cursor-pointer ${
                    active ? "bg-ifr-active text-ifr-green font-medium" : "hover:bg-ifr-search text-ifr-text-secondary"
                  }`}
                  style={{
                    fontFamily: "var(--ifr-font-body)",
                    fontSize: "var(--ifr-fs-base)",
                    fontWeight: "var(--ifr-fw-medium)",
                  }}
                >
                  {active ? "✓ " : "+ "}
                  {cat}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Power/Environmental — designs and products */}
        {variant !== "services" && (
          <>
            <FilterSection icon={<Flash size={16} />} label="Power Compatibility">
              <CheckboxFilter
                items={["110V AC", "220V AC", "12V DC", "24V DC", "Battery Powered", "USB-C PD", "Solar Compatible"]}
              />
            </FilterSection>

            <FilterSection icon={<Recycle size={16} />} label="Environmental Impact">
              <div className="text-ifr-text-secondary text-sm">
                <p style={{ fontFamily: "var(--ifr-font-body)" }}>
                  {t(
                    "Environmental filters coming soon. Track energy consumption and CO2 emissions of hardware projects."
                  )}
                </p>
              </div>
            </FilterSection>
          </>
        )}

        {/* Sticky bottom action bar */}
        {hasActiveFilters && (
          <div className="sticky bottom-0 bg-ifr-surface border-t border-ifr px-6 py-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={clearAllFilters}
              className="w-full bg-transparent border border-ifr text-ifr-text-secondary hover:text-ifr-text-primary hover:border-ifr-text-secondary flex items-center justify-center transition-colors"
              style={{
                height: "var(--ifr-control-height)",
                borderRadius: "var(--ifr-radius-md)",
                fontFamily: "var(--ifr-font-body)",
                fontSize: "var(--ifr-fs-base)",
                fontWeight: "var(--ifr-fw-medium)",
              }}
            >
              {t("Reset filters")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
