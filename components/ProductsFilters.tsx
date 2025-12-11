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
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { QUERY_MACHINES } from "lib/QueryAndMutation";
import { RESOURCE_SPEC_MACHINE, MACHINE_TYPES } from "lib/resourceSpecs";
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
  powerRequirement: string;
  replicability: string[];
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

const POWER_COMPATIBILITY_OPTIONS = ["AC", "DC", "Battery", "Solar", "USB"];

const REPLICABILITY_OPTIONS = ["High", "Medium", "Low"];

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
    power: false,
    replicability: false,
  });

  // Filter state
  const [filters, setFilters] = useState<ProductsFiltersState>({
    manufacturability: [],
    machinesNeeded: [],
    materialsNeeded: [],
    location: "",
    tags: [],
    powerCompatibility: [],
    powerRequirement: "",
    replicability: [],
  });

  // Load filters from URL on mount
  useEffect(() => {
    const query = router.query;
    setFilters({
      manufacturability: query.manufacturability ? (query.manufacturability as string).split(",") : [],
      machinesNeeded: query.machines ? (query.machines as string).split(",") : [],
      materialsNeeded: query.materials ? (query.materials as string).split(",") : [],
      location: (query.location as string) || "",
      tags: query.tags ? (query.tags as string).split(",") : [],
      powerCompatibility: query.power ? (query.power as string).split(",") : [],
      powerRequirement: (query.powerReq as string) || "",
      replicability: query.replicability ? (query.replicability as string).split(",") : [],
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

    if (filters.manufacturability.length > 0) query.manufacturability = filters.manufacturability.join(",");
    if (filters.machinesNeeded.length > 0) query.machines = filters.machinesNeeded.join(",");
    if (filters.materialsNeeded.length > 0) query.materials = filters.materialsNeeded.join(",");
    if (filters.location) query.location = filters.location;
    if (filters.tags.length > 0) query.tags = filters.tags.join(",");
    if (filters.powerCompatibility.length > 0) query.power = filters.powerCompatibility.join(",");
    if (filters.powerRequirement) query.powerReq = filters.powerRequirement;
    if (filters.replicability.length > 0) query.replicability = filters.replicability.join(",");

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
      powerRequirement: "",
      replicability: [],
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
                setFilters(prev => ({ ...prev, location: location?.address || "" }));
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
        <button onClick={() => toggleSection("power")} className="flex items-center justify-between w-full text-left">
          <span className="font-medium text-gray-900" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
            {t("Power Compatibility")}
          </span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${openSections.power ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSections.power && (
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
