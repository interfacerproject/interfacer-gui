// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { Chemistry, Cube, Flash, LocationStar, Recycle, Settings, Tag, Time, Tools } from "@carbon/icons-react";
import { ScaleIcon } from "@heroicons/react/outline";
import CheckboxFilter from "components/CheckboxFilter";
import DualRangeSlider from "components/DualRangeSlider";
import FilterSection from "components/FilterSection";
import ToggleSwitch from "components/ToggleSwitch";
import {
  AVAILABILITY_OPTIONS,
  POWER_COMPATIBILITY_OPTIONS,
  PRODUCT_CATEGORY_OPTIONS,
  REPAIRABILITY_AVAILABLE_TAG,
  SERVICE_TYPE_OPTIONS,
  TAG_PREFIX,
  slugifyTagValue,
} from "lib/tagging";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";

export type CatalogVariant = "designs" | "products" | "services";

interface CatalogFilterSidebarProps {
  variant: CatalogVariant;
  collapsed?: boolean;
  onToggle?: () => void;
}

/** Given current URL tags, a tag prefix, and the items list, return which items are currently selected */
function getSelectedItems(tags: string[], prefix: string, items: readonly string[]): string[] {
  const tagSet = new Set(tags);
  return items.filter(item => {
    const tag = `${prefix}-${slugifyTagValue(item)}`;
    return tagSet.has(tag);
  });
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

export default function CatalogFilterSidebar({ variant, collapsed = false, onToggle }: CatalogFilterSidebarProps) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [manufacturingFilter, setManufacturingFilter] = useState("all");
  const [searchRadius, setSearchRadius] = useState(50);

  // Range slider states for products
  const [powerRange, setPowerRange] = useState<[number, number]>([0, 2000]);
  const [co2Range, setCo2Range] = useState<[number, number]>([0, 500]);
  const [energyRange, setEnergyRange] = useState<[number, number]>([0, 1000]);

  // Parse current tags from URL
  const currentTags = useMemo(() => {
    const t = router.query.tags;
    if (!t) return [] as string[];
    return typeof t === "string" ? t.split(",") : (t as string[]);
  }, [router.query.tags]);

  const selectedMachines = useMemo(() => getSelectedItems(currentTags, TAG_PREFIX.MACHINE, MACHINES), [currentTags]);
  const selectedMaterials = useMemo(() => getSelectedItems(currentTags, TAG_PREFIX.MATERIAL, MATERIALS), [currentTags]);
  const selectedLicenses = useMemo(() => getSelectedItems(currentTags, TAG_PREFIX.LICENSE, LICENSES), [currentTags]);
  const selectedServiceTypes = useMemo(
    () => getSelectedItems(currentTags, TAG_PREFIX.SERVICE_TYPE, SERVICE_TYPE_OPTIONS),
    [currentTags]
  );
  const selectedAvailability = useMemo(
    () => getSelectedItems(currentTags, TAG_PREFIX.AVAILABILITY, AVAILABILITY_OPTIONS),
    [currentTags]
  );
  const selectedPower = useMemo(
    () => getSelectedItems(currentTags, TAG_PREFIX.POWER_COMPAT, POWER_COMPATIBILITY_OPTIONS),
    [currentTags]
  );
  const repairInfo = useMemo(() => currentTags.includes(REPAIRABILITY_AVAILABLE_TAG), [currentTags]);

  // Toggle a tag in the URL
  const toggleTag = useCallback(
    (prefix: string) => (item: string) => {
      const encoded = `${prefix}-${slugifyTagValue(item)}`;
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
      const encoded = `${TAG_PREFIX.CATEGORY}-${slugifyTagValue(cat)}`;
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

  const selectedCategories = useMemo(
    () => getSelectedItems(currentTags, TAG_PREFIX.CATEGORY, PRODUCT_CATEGORY_OPTIONS),
    [currentTags]
  );

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
                onToggle={toggleTag(TAG_PREFIX.MACHINE)}
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
                onToggle={toggleTag(TAG_PREFIX.MATERIAL)}
              />
            </FilterSection>

            <FilterSection
              icon={<ScaleIcon className="w-4 h-4" />}
              label="License"
              badge={selectedLicenses.length || undefined}
            >
              <CheckboxFilter
                items={LICENSES}
                searchPlaceholder="Search licenses..."
                selectedItems={selectedLicenses}
                onToggle={toggleTag(TAG_PREFIX.LICENSE)}
              />
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
                  <div
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setManufacturingFilter(option.value)}
                  >
                    <div
                      className="w-4 h-4 border shrink-0 flex items-center justify-center transition-colors"
                      style={{
                        borderRadius: "50%",
                        backgroundColor:
                          manufacturingFilter === option.value ? "var(--ifr-green)" : "var(--ifr-bg-surface)",
                        borderColor: manufacturingFilter === option.value ? "var(--ifr-green)" : "var(--ifr-border)",
                      }}
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
                  </div>
                ))}
              </div>
            </FilterSection>
          </>
        )}

        {/* PRODUCTS variant */}
        {variant === "products" && (
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
                onToggle={toggleTag(TAG_PREFIX.MACHINE)}
              />
            </FilterSection>

            <FilterSection icon={<Cube size={16} />} label="Materials" badge={selectedMaterials.length || undefined}>
              <CheckboxFilter
                items={MATERIALS}
                searchPlaceholder="Search materials..."
                selectedItems={selectedMaterials}
                onToggle={toggleTag(TAG_PREFIX.MATERIAL)}
              />
            </FilterSection>

            <FilterSection icon={<Flash size={16} />} label="Power Requirement">
              <DualRangeSlider
                min={0}
                max={2000}
                step={50}
                unit="W"
                valueLow={powerRange[0]}
                valueHigh={powerRange[1]}
                onChange={(low, high) => setPowerRange([low, high])}
              />
            </FilterSection>

            <FilterSection icon={<Tools size={16} />} label="Repairability">
              <ToggleSwitch
                label={t("Repair Info Available")}
                description={t("Projects with repair and maintenance info")}
                checked={repairInfo}
                onChange={checked => {
                  const newTags = checked
                    ? [...currentTags, REPAIRABILITY_AVAILABLE_TAG]
                    : currentTags.filter(t => t !== REPAIRABILITY_AVAILABLE_TAG);
                  const query = { ...router.query };
                  if (newTags.length > 0) {
                    query.tags = newTags.join(",");
                  } else {
                    delete query.tags;
                  }
                  router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
                }}
              />
            </FilterSection>

            <FilterSection icon={<Tools size={16} />} label="Manufacturability">
              <div className="flex flex-col gap-2.5">
                {[
                  { value: "all", label: "All" },
                  { value: "can_be_manufactured", label: "Can be manufactured" },
                  { value: "in_progress", label: "In progress" },
                ].map(option => (
                  <div
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setManufacturingFilter(option.value)}
                  >
                    <div
                      className="w-4 h-4 border shrink-0 flex items-center justify-center transition-colors"
                      style={{
                        borderRadius: "50%",
                        backgroundColor:
                          manufacturingFilter === option.value ? "var(--ifr-green)" : "var(--ifr-bg-surface)",
                        borderColor: manufacturingFilter === option.value ? "var(--ifr-green)" : "var(--ifr-border)",
                      }}
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
                  </div>
                ))}
              </div>
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
                <label
                  className="text-ifr-text-primary mt-2"
                  style={{
                    fontFamily: "var(--ifr-font-body)",
                    fontSize: "var(--ifr-fs-sm)",
                    fontWeight: "var(--ifr-fw-medium)",
                  }}
                >
                  {t("Search Radius")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[10, 25, 50, 100, 250].map(km => (
                    <button
                      key={km}
                      type="button"
                      onClick={() => setSearchRadius(km)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        searchRadius === km
                          ? "bg-[#036a53] text-white"
                          : "border border-[#c9cccf] text-[#0b1324] hover:bg-ifr-hover"
                      }`}
                    >
                      {km}
                      {t("km")}
                    </button>
                  ))}
                </div>
              </div>
            </FilterSection>

            <FilterSection
              icon={<Chemistry size={16} />}
              label="Service Type"
              defaultOpen
              badge={selectedServiceTypes.length || undefined}
            >
              <CheckboxFilter
                items={[...SERVICE_TYPE_OPTIONS]}
                selectedItems={selectedServiceTypes}
                onToggle={toggleTag(TAG_PREFIX.SERVICE_TYPE)}
              />
            </FilterSection>

            <FilterSection
              icon={<Time size={16} />}
              label="Availability"
              badge={selectedAvailability.length || undefined}
            >
              <CheckboxFilter
                items={[...AVAILABILITY_OPTIONS]}
                selectedItems={selectedAvailability}
                onToggle={toggleTag(TAG_PREFIX.AVAILABILITY)}
              />
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
                onToggle={toggleTag(TAG_PREFIX.MACHINE)}
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
            {PRODUCT_CATEGORY_OPTIONS.map(cat => {
              const active = selectedCategories.includes(cat);
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
            <FilterSection
              icon={<Flash size={16} />}
              label="Power Compatibility"
              badge={selectedPower.length || undefined}
            >
              <CheckboxFilter
                items={[...POWER_COMPATIBILITY_OPTIONS]}
                selectedItems={selectedPower}
                onToggle={toggleTag(TAG_PREFIX.POWER_COMPAT)}
              />
            </FilterSection>

            <FilterSection icon={<Recycle size={16} />} label="Environmental Impact">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span
                    className="text-ifr-text-primary"
                    style={{
                      fontFamily: "var(--ifr-font-body)",
                      fontSize: "var(--ifr-fs-sm)",
                      fontWeight: "var(--ifr-fw-medium)",
                    }}
                  >
                    {t("CO\u2082 Emissions")}
                  </span>
                  <DualRangeSlider
                    min={0}
                    max={500}
                    step={10}
                    unit="kg"
                    valueLow={co2Range[0]}
                    valueHigh={co2Range[1]}
                    onChange={(low, high) => setCo2Range([low, high])}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span
                    className="text-ifr-text-primary"
                    style={{
                      fontFamily: "var(--ifr-font-body)",
                      fontSize: "var(--ifr-fs-sm)",
                      fontWeight: "var(--ifr-fw-medium)",
                    }}
                  >
                    {t("Energy Consumption")}
                  </span>
                  <DualRangeSlider
                    min={0}
                    max={1000}
                    step={10}
                    unit="kWh"
                    valueLow={energyRange[0]}
                    valueHigh={energyRange[1]}
                    onChange={(low, high) => setEnergyRange([low, high])}
                  />
                </div>
              </div>
            </FilterSection>
          </>
        )}

        {/* Sticky bottom action bar */}
        <div className="sticky bottom-0 bg-ifr-surface border-t border-ifr px-6 py-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              /* Filters are already applied instantly via URL params — this button serves as a visual confirmation + scroll-to-top */
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-full text-[#0b1324] flex items-center justify-center transition-colors hover:brightness-95"
            style={{
              height: "var(--ifr-control-height)",
              borderRadius: "var(--ifr-radius-md)",
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-base)",
              fontWeight: "var(--ifr-fw-semibold)",
              backgroundColor: "#f1bd4d",
            }}
          >
            {t("Apply Filters")}
          </button>
          {hasActiveFilters && (
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
          )}
        </div>
      </div>
    </div>
  );
}
