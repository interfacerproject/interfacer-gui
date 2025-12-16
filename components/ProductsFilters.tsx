// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { useQuery } from "@apollo/client";
import { QUERY_MACHINES } from "lib/QueryAndMutation";
import { MACHINE_TYPES, RESOURCE_SPEC_MACHINE } from "lib/resourceSpecs";
import {
  CO2_THRESHOLDS_KG,
  ENERGY_THRESHOLDS_KWH,
  isPrefixedTag,
  mergeTags,
  POWER_COMPATIBILITY_OPTIONS,
  POWER_REQUIREMENT_THRESHOLDS_W,
  prefixedTag,
  rangeFilterTags,
  REPLICABILITY_OPTIONS,
  TAG_PREFIX,
} from "lib/tagging";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import SearchLocation from "./SearchLocation";
import SelectTags from "./SelectTags";

//

// Machine resource from backend
interface MachineResource {
  id: string;
  name: string;
  note?: string | null;
}

interface MachinesQueryData {
  economicResources: {
    edges: Array<{
      node: MachineResource;
    }>;
  };
}

export interface ProductsFiltersState {
  manufacturability: string[];
  machinesNeeded: string[]; // Now stores machine IDs instead of names
  materialsNeeded: string[];
  location: string;
  tags: string[];
  powerCompatibility: string[];
  powerRequirementMin: string;
  powerRequirementMax: string;
  replicability: string[];
  energyMin: string;
  energyMax: string;
  co2Min: string;
  co2Max: string;
}

// Fallback static options (shown when no machines in database)
const FALLBACK_MACHINES_OPTIONS = [
  "3D Printer",
  "CNC Mill",
  "Laser Cutter",
  "PCB Mill",
  "Vinyl Cutter",
  "Embroidery Machine",
  "Soldering Iron",
  "Router",
  "Drill Press",
];

const MATERIALS_OPTIONS = ["PLA", "ABS", "PETG", "Aluminum", "Steel", "Wood", "Acrylic", "Carbon Fiber", "Plywood"];

const MANUFACTURABILITY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "can-manufacture", label: "Can be Manufactured" },
  { value: "in-progress", label: "In Progress" },
];

// Option lists are exported from lib/tagging to keep create flow + filters consistent.

//

export default function ProductsFilters() {
  const { t } = useTranslation("productsProps");
  const router = useRouter();

  // Query available machines from backend
  const { data: machinesData, loading: machinesLoading } = useQuery<MachinesQueryData>(QUERY_MACHINES, {
    variables: {
      resourceSpecId: RESOURCE_SPEC_MACHINE,
    },
  });

  // Get machines list from query or use fallback
  const availableMachines = machinesData?.economicResources?.edges?.map(edge => edge.node) || [];

  // Helper to get machine icon
  const getMachineIcon = (machineName: string): string => {
    const machineType = MACHINE_TYPES.find(m => m.name.toLowerCase() === machineName.toLowerCase());
    return machineType?.icon || "wrench";
  };

  const getIconEmoji = (icon: string): string => {
    const iconMap: Record<string, string> = {
      laser: "⚡",
      "printer-3d": "🖨️",
      cnc: "⚙️",
      solder: "🔥",
      pcb: "📟",
      vinyl: "✂️",
      oven: "🔥",
      wrench: "🔧",
    };
    return iconMap[icon] || "🔧";
  };

  // Collapsible sections state
  const [openSections, setOpenSections] = useState({
    manufacturability: true,
    machines: false,
    materials: false,
    location: false,
    tags: true,
    powerCompatibility: false,
    powerRequirement: false,
    replicability: false,
    environmentalImpact: false,
  });

  // Filter state
  const [filters, setFilters] = useState<ProductsFiltersState>({
    manufacturability: [],
    machinesNeeded: [],
    materialsNeeded: [],
    location: "",
    tags: [],
    powerCompatibility: [],
    powerRequirementMin: "",
    powerRequirementMax: "",
    replicability: [],
    energyMin: "",
    energyMax: "",
    co2Min: "",
    co2Max: "",
  });

  // Load filters from URL on mount
  useEffect(() => {
    const query = router.query;

    const rawTags = query.tags ? (query.tags as string).split(",") : [];
    // Keep derived tags out of the user tags selector.
    const userTags = rawTags.filter(
      tag =>
        !isPrefixedTag(tag, [
          TAG_PREFIX.MACHINE,
          TAG_PREFIX.MATERIAL,
          TAG_PREFIX.CATEGORY,
          TAG_PREFIX.POWER_COMPAT,
          TAG_PREFIX.POWER_REQ,
          TAG_PREFIX.REPLICABILITY,
          TAG_PREFIX.ENV_ENERGY,
          TAG_PREFIX.ENV_CO2,
        ])
    );

    const manufacturability = query.manufacturability
      ? (query.manufacturability as string).split(",")
      : (() => {
          const show = (query.show as string) || "";
          if (show === "designs") return ["in-progress"];
          if (show === "products") return ["can-manufacture"];
          return [];
        })();

    setFilters({
      manufacturability,
      machinesNeeded: query.machines ? (query.machines as string).split(",") : [],
      materialsNeeded: query.materials ? (query.materials as string).split(",") : [],
      location: (query.location as string) || "",
      tags: userTags,
      powerCompatibility: query.power ? (query.power as string).split(",") : [],
      powerRequirementMin: (query.powerMin as string) || "",
      powerRequirementMax: (query.powerMax as string) || "",
      replicability: query.replicability ? (query.replicability as string).split(",") : [],
      energyMin: (query.energyMin as string) || "",
      energyMax: (query.energyMax as string) || "",
      co2Min: (query.co2Min as string) || "",
      co2Max: (query.co2Max as string) || "",
    });
  }, [router.query]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCheckboxChange = (category: keyof ProductsFiltersState, value: string, checked: boolean) => {
    setFilters(prev => {
      const currentValues = prev[category] as string[];
      const newValues = checked ? [...currentValues, value] : currentValues.filter(v => v !== value);
      return { ...prev, [category]: newValues };
    });
  };

  const applyFilters = () => {
    const query: any = {};

    const rawTags = (() => {
      const value = router.query.tags;
      if (!value) return [] as string[];
      if (Array.isArray(value)) return value.flatMap(v => v.split(",").filter(Boolean));
      return value.split(",").filter(Boolean);
    })();

    // Preserve non-sidebar query params.
    for (const key of ["q", "sort", "show"]) {
      const value = router.query[key];
      if (typeof value === "string" && value.length > 0) query[key] = value;
    }

    const machineTags = filters.machinesNeeded
      .map(selected => {
        const machineName = availableMachines.find(m => m.id === selected)?.name || selected;
        return prefixedTag(TAG_PREFIX.MACHINE, machineName);
      })
      .filter((t): t is string => Boolean(t));

    const materialTags = filters.materialsNeeded
      .map(material => prefixedTag(TAG_PREFIX.MATERIAL, material))
      .filter((t): t is string => Boolean(t));

    const powerCompatTags = filters.powerCompatibility
      .map(value => prefixedTag(TAG_PREFIX.POWER_COMPAT, value))
      .filter((t): t is string => Boolean(t));

    const replicabilityTags = filters.replicability
      .map(value => prefixedTag(TAG_PREFIX.REPLICABILITY, value))
      .filter((t): t is string => Boolean(t));

    const powerMin = filters.powerRequirementMin ? Number(filters.powerRequirementMin) : undefined;
    const powerMax = filters.powerRequirementMax ? Number(filters.powerRequirementMax) : undefined;
    const powerReqTags = rangeFilterTags(TAG_PREFIX.POWER_REQ, powerMin, powerMax, POWER_REQUIREMENT_THRESHOLDS_W);

    const energyMin = filters.energyMin ? Number(filters.energyMin) : undefined;
    const energyMax = filters.energyMax ? Number(filters.energyMax) : undefined;
    const energyTags = rangeFilterTags(TAG_PREFIX.ENV_ENERGY, energyMin, energyMax, ENERGY_THRESHOLDS_KWH);

    const co2Min = filters.co2Min ? Number(filters.co2Min) : undefined;
    const co2Max = filters.co2Max ? Number(filters.co2Max) : undefined;
    const co2Tags = rangeFilterTags(TAG_PREFIX.ENV_CO2, co2Min, co2Max, CO2_THRESHOLDS_KG);

    const existingCategoryTags = rawTags.filter(tag => tag.startsWith(`${TAG_PREFIX.CATEGORY}-`));

    const combinedTags = mergeTags(
      filters.tags,
      existingCategoryTags,
      machineTags,
      materialTags,
      powerCompatTags,
      replicabilityTags,
      powerReqTags,
      energyTags,
      co2Tags
    );

    if (filters.manufacturability.length > 0) query.manufacturability = filters.manufacturability.join(",");

    // Manufacturability is implemented as a spec/type filter (conformsTo) via the existing `show` param.
    const manufacturabilityValue = filters.manufacturability[0];
    if (manufacturabilityValue === "in-progress") query.show = "designs";
    if (manufacturabilityValue === "can-manufacture") query.show = "products";
    if (manufacturabilityValue === "all") delete query.show;

    if (filters.machinesNeeded.length > 0) query.machines = filters.machinesNeeded.join(",");
    if (filters.materialsNeeded.length > 0) query.materials = filters.materialsNeeded.join(",");
    if (filters.location) query.location = filters.location;
    if (combinedTags.length > 0) query.tags = combinedTags.join(",");
    if (filters.powerCompatibility.length > 0) query.power = filters.powerCompatibility.join(",");
    if (filters.powerRequirementMin) query.powerMin = filters.powerRequirementMin;
    if (filters.powerRequirementMax) query.powerMax = filters.powerRequirementMax;
    if (filters.replicability.length > 0) query.replicability = filters.replicability.join(",");
    if (filters.energyMin) query.energyMin = filters.energyMin;
    if (filters.energyMax) query.energyMax = filters.energyMax;
    if (filters.co2Min) query.co2Min = filters.co2Min;
    if (filters.co2Max) query.co2Max = filters.co2Max;

    router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  const resetFilters = () => {
    setFilters({
      manufacturability: [],
      machinesNeeded: [],
      materialsNeeded: [],
      location: "",
      tags: [],
      powerCompatibility: [],
      powerRequirementMin: "",
      powerRequirementMax: "",
      replicability: [],
      energyMin: "",
      energyMax: "",
      co2Min: "",
      co2Max: "",
    });
    router.push({ pathname: router.pathname }, undefined, { shallow: true });
  };

  const activeFilterCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) return count + value.length;
    if (typeof value === "string" && value) return count + 1;
    return count;
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
          {t("Filter by")}
        </h3>
        {activeFilterCount > 0 && (
          <span className="text-xs font-medium text-white bg-[#036A53] px-2 py-1 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </div>

      {/* Manufacturability */}
      <div className="border-b border-[#C9CCCF] pb-4">
        <button
          onClick={() => toggleSection("manufacturability")}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-900" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
            {t("Manufacturability")}
          </span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              openSections.manufacturability ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSections.manufacturability && (
          <div className="mt-3 space-y-2">
            {MANUFACTURABILITY_OPTIONS.map(option => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`manuf-${option.value}`}
                  name="manufacturability"
                  value={option.value}
                  checked={filters.manufacturability.includes(option.value)}
                  onChange={e => {
                    setFilters(prev => ({
                      ...prev,
                      manufacturability: e.target.checked ? [option.value] : [],
                    }));
                  }}
                  className="w-4 h-4 text-[#036A53] focus:ring-[#036A53]"
                />
                <label htmlFor={`manuf-${option.value}`} className="ml-2 text-sm text-gray-700">
                  {t(option.label)}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Machines Needed */}
      <div className="border-b border-[#C9CCCF] pb-4">
        <button
          onClick={() => toggleSection("machines")}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-900" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
            {t("Machines Needed")}
          </span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${openSections.machines ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSections.machines && (
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
            {machinesLoading ? (
              <div className="text-sm text-gray-500">{t("Loading machines...")}</div>
            ) : availableMachines.length > 0 ? (
              availableMachines.map(machine => (
                <div key={machine.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`machine-${machine.id}`}
                    checked={filters.machinesNeeded.includes(machine.id)}
                    onChange={e => handleCheckboxChange("machinesNeeded", machine.id, e.target.checked)}
                    className="w-4 h-4 text-[#036A53] focus:ring-[#036A53] rounded"
                  />
                  <span className="ml-2 mr-1 text-sm">{getIconEmoji(getMachineIcon(machine.name))}</span>
                  <label htmlFor={`machine-${machine.id}`} className="text-sm text-gray-700">
                    {machine.name}
                  </label>
                </div>
              ))
            ) : (
              // Fallback to static options when no machines in database
              FALLBACK_MACHINES_OPTIONS.map(machine => (
                <div key={machine} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`machine-${machine}`}
                    checked={filters.machinesNeeded.includes(machine)}
                    onChange={e => handleCheckboxChange("machinesNeeded", machine, e.target.checked)}
                    className="w-4 h-4 text-[#036A53] focus:ring-[#036A53] rounded"
                  />
                  <span className="ml-2 mr-1 text-sm">{getIconEmoji(getMachineIcon(machine))}</span>
                  <label htmlFor={`machine-${machine}`} className="text-sm text-gray-700">
                    {machine}
                  </label>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Materials Needed */}
      <div className="border-b border-[#C9CCCF] pb-4">
        <button
          onClick={() => toggleSection("materials")}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-900" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
            {t("Materials Needed")}
          </span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${openSections.materials ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSections.materials && (
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
            {MATERIALS_OPTIONS.map(material => (
              <div key={material} className="flex items-center">
                <input
                  type="checkbox"
                  id={`material-${material}`}
                  checked={filters.materialsNeeded.includes(material)}
                  onChange={e => handleCheckboxChange("materialsNeeded", material, e.target.checked)}
                  className="w-4 h-4 text-[#036A53] focus:ring-[#036A53] rounded"
                />
                <label htmlFor={`material-${material}`} className="ml-2 text-sm text-gray-700">
                  {material}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Location */}
      <div className="border-b border-[#C9CCCF] pb-4">
        <button
          onClick={() => toggleSection("location")}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-900" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
            {t("Location")}
          </span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${openSections.location ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSections.location && (
          <div className="mt-3">
            <SearchLocation
              id="products-location-filter"
              onSelect={location => {
                setFilters(prev => ({ ...prev, location: location?.address?.label || "" }));
              }}
              placeholder={t("Search by city, country...")}
            />
            {filters.location && (
              <div className="mt-2 text-xs text-gray-600 flex items-center justify-between bg-gray-50 p-2 rounded">
                <span>{filters.location}</span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, location: "" }))}
                  className="text-red-500 hover:text-red-700"
                >
                  {"×"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Categories & Tags */}
      <div className="border-b border-[#C9CCCF] pb-4">
        <button onClick={() => toggleSection("tags")} className="flex items-center justify-between w-full text-left">
          <span className="font-medium text-gray-900" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
            {t("Categories & Tags")}
          </span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${openSections.tags ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSections.tags && (
          <div className="mt-3">
            <SelectTags
              tags={filters.tags}
              setTags={tags => setFilters(prev => ({ ...prev, tags }))}
              placeholder={t("Search or create tags...")}
            />
          </div>
        )}
      </div>

      {/* Power Compatibility */}
      <div className="border-b border-[#C9CCCF] pb-4">
        <button
          onClick={() => toggleSection("powerCompatibility")}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-900" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
            {t("Power Compatibility")}
          </span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              openSections.powerCompatibility ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSections.powerCompatibility && (
          <div className="mt-3 space-y-2">
            {POWER_COMPATIBILITY_OPTIONS.map(option => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`power-${option}`}
                  checked={filters.powerCompatibility.includes(option)}
                  onChange={e => handleCheckboxChange("powerCompatibility", option, e.target.checked)}
                  className="w-4 h-4 text-[#036A53] focus:ring-[#036A53] rounded"
                />
                <label htmlFor={`power-${option}`} className="ml-2 text-sm text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Power Requirement */}
      <div className="border-b border-[#C9CCCF] pb-4">
        <button
          onClick={() => toggleSection("powerRequirement")}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-900" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
            {t("Power Requirement")}
          </span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              openSections.powerRequirement ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSections.powerRequirement && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">{t("Min")}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={filters.powerRequirementMin}
                  onChange={e => setFilters(prev => ({ ...prev, powerRequirementMin: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#036A53] focus:border-transparent text-sm"
                  placeholder="0"
                />
                <span className="text-xs text-gray-600">W</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">{t("Max")}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={filters.powerRequirementMax}
                  onChange={e => setFilters(prev => ({ ...prev, powerRequirementMax: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#036A53] focus:border-transparent text-sm"
                  placeholder="2000"
                />
                <span className="text-xs text-gray-600">W</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Replicability */}
      <div className="border-b border-[#C9CCCF] pb-4">
        <button
          onClick={() => toggleSection("replicability")}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-900" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
            {t("Replicability")}
          </span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${openSections.replicability ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSections.replicability && (
          <div className="mt-3 space-y-2">
            {REPLICABILITY_OPTIONS.map(option => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`replicability-${option}`}
                  checked={filters.replicability.includes(option)}
                  onChange={e => handleCheckboxChange("replicability", option, e.target.checked)}
                  className="w-4 h-4 text-[#036A53] focus:ring-[#036A53] rounded"
                />
                <label htmlFor={`replicability-${option}`} className="ml-2 text-sm text-gray-700">
                  {t(option)}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Environmental Impact */}
      <div className="border-b border-[#C9CCCF] pb-4">
        <button
          onClick={() => toggleSection("environmentalImpact")}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-900" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
            {t("Environmental Impact")}
          </span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              openSections.environmentalImpact ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSections.environmentalImpact && (
          <div className="mt-3 space-y-4">
            <div>
              <p className="text-sm text-gray-700 mb-2">{t("Energy consumption")}</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t("Min")}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={filters.energyMin}
                      onChange={e => setFilters(prev => ({ ...prev, energyMin: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#036A53] focus:border-transparent text-sm"
                      placeholder="0"
                    />
                    <span className="text-xs text-gray-600">{"kWh"}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t("Max")}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={filters.energyMax}
                      onChange={e => setFilters(prev => ({ ...prev, energyMax: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#036A53] focus:border-transparent text-sm"
                      placeholder="2000"
                    />
                    <span className="text-xs text-gray-600">{"kWh"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-700 mb-2">{t("CO2 emissions")}</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t("Min")}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={filters.co2Min}
                      onChange={e => setFilters(prev => ({ ...prev, co2Min: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#036A53] focus:border-transparent text-sm"
                      placeholder="0"
                      step="0.1"
                    />
                    <span className="text-xs text-gray-600">{"kg"}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t("Max")}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={filters.co2Max}
                      onChange={e => setFilters(prev => ({ ...prev, co2Max: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#036A53] focus:border-transparent text-sm"
                      placeholder="20"
                      step="0.1"
                    />
                    <span className="text-xs text-gray-600">{"kg"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <button
          onClick={applyFilters}
          className="flex-1 bg-[#036A53] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#025845] transition-colors"
          style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
        >
          {t("Apply Filters")}
        </button>
        <button
          onClick={resetFilters}
          className="flex-1 border border-[#C9CCCF] text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
        >
          {t("Reset")}
        </button>
      </div>
    </div>
  );
}
