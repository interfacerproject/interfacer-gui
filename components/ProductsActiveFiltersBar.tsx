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
import { Tag } from "@bbtgnn/polaris-interfacer";
import { useResourceSpecs } from "hooks/useResourceSpecs";
import { QUERY_MACHINES } from "lib/QueryAndMutation";
import { isPrefixedTag, prefixedTag, REPAIRABILITY_AVAILABLE_TAG, TAG_PREFIX } from "lib/tagging";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

interface MachineResource {
  id: string;
  name: string;
}

interface MachinesQueryData {
  economicResources: {
    edges: Array<{
      node: MachineResource;
    }>;
  };
}

type QueryValue = string | string[] | undefined;

function asCsvArray(value: QueryValue): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(v => v.split(",").filter(Boolean));
  return value.split(",").filter(Boolean);
}

function asString(value: QueryValue): string {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
}

function removeFromCsvParam(value: QueryValue, toRemove: string): string | undefined {
  const next = asCsvArray(value).filter(v => v !== toRemove);
  return next.length > 0 ? next.join(",") : undefined;
}

function stripPrefix(tag: string, prefix: string): string {
  return tag.startsWith(`${prefix}-`) ? tag.slice(prefix.length + 1) : tag;
}

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function removeTagsByPrefix(allTags: string[], prefix: string): string[] {
  return allTags.filter(tag => !tag.startsWith(`${prefix}-`));
}

export default function ProductsActiveFiltersBar() {
  const { t } = useTranslation("productsProps");
  const router = useRouter();

  // Get spec IDs from backend via hook
  const { specMachine } = useResourceSpecs();

  const { data: machinesData } = useQuery<MachinesQueryData>(QUERY_MACHINES, {
    variables: { resourceSpecId: specMachine?.id || "" },
    skip: !specMachine?.id,
  });

  const availableMachines = machinesData?.economicResources?.edges?.map(e => e.node) || [];
  const machineNameById = new Map(availableMachines.map(m => [m.id, m.name] as const));

  const rawTags = asCsvArray(router.query.tags);
  const machines = asCsvArray(router.query.machines);
  const materials = asCsvArray(router.query.materials);

  const categoryTags = rawTags.filter(tag => tag.startsWith(`${TAG_PREFIX.CATEGORY}-`));

  const userTags = rawTags.filter(
    tag =>
      !isPrefixedTag(tag, [
        TAG_PREFIX.MACHINE,
        TAG_PREFIX.MATERIAL,
        TAG_PREFIX.CATEGORY,
        TAG_PREFIX.POWER_COMPAT,
        TAG_PREFIX.POWER_REQ,
        TAG_PREFIX.REPLICABILITY,
        TAG_PREFIX.RECYCLABILITY,
        TAG_PREFIX.REPAIRABILITY,
        TAG_PREFIX.ENV_ENERGY,
        TAG_PREFIX.ENV_CO2,
      ])
  );

  const derivedManufacturability = (() => {
    const fromParam = asCsvArray(router.query.manufacturability);
    if (fromParam.length > 0) return fromParam[0];

    const show = asString(router.query.show);
    if (show === "designs") return "in-progress";
    if (show === "products") return "can-manufacture";
    return "";
  })();

  const show = asString(router.query.show);

  const powerMin = asString(router.query.powerMin);
  const powerMax = asString(router.query.powerMax);
  const energyMin = asString(router.query.energyMin);
  const energyMax = asString(router.query.energyMax);
  const co2Min = asString(router.query.co2Min);
  const co2Max = asString(router.query.co2Max);

  const hasAnyActive =
    Boolean(asString(router.query.q)) ||
    Boolean(asString(router.query.location)) ||
    userTags.length > 0 ||
    categoryTags.length > 0 ||
    machines.length > 0 ||
    materials.length > 0 ||
    Boolean(derivedManufacturability) ||
    (show.length > 0 && show !== "all") ||
    asCsvArray(router.query.power).length > 0 ||
    Boolean(powerMin) ||
    Boolean(powerMax) ||
    Boolean(energyMin) ||
    Boolean(energyMax) ||
    Boolean(co2Min) ||
    Boolean(co2Max) ||
    asCsvArray(router.query.replicability).length > 0 ||
    Boolean(asString(router.query.recyclabilityMin)) ||
    Boolean(asString(router.query.recyclabilityMax)) ||
    asString(router.query.repairability) === "true";

  if (!hasAnyActive) return null;

  const pushQuery = (nextQuery: Record<string, any>) => {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(nextQuery)) {
      if (value === undefined) continue;
      if (typeof value === "string" && value.length === 0) continue;
      cleaned[key] = value;
    }
    router.push({ pathname: router.pathname, query: cleaned }, undefined, { shallow: true });
  };

  const clearAll = () => {
    router.push({ pathname: router.pathname }, undefined, { shallow: true });
  };

  const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];

  const q = asString(router.query.q);
  if (q) {
    chips.push({
      key: `q:${q}`,
      label: `${t("Search")}: ${q}`,
      onRemove: () => {
        const next = { ...router.query };
        delete next.q;
        pushQuery(next);
      },
    });
  }

  const location = asString(router.query.location);
  if (location) {
    chips.push({
      key: `location:${location}`,
      label: `${t("Location")}: ${location}`,
      onRemove: () => {
        const next = { ...router.query };
        delete next.location;
        pushQuery(next);
      },
    });
  }

  if (derivedManufacturability) {
    const label =
      derivedManufacturability === "in-progress"
        ? t("In Progress")
        : derivedManufacturability === "can-manufacture"
        ? t("Can be Manufactured")
        : derivedManufacturability;

    chips.push({
      key: `manufacturability:${derivedManufacturability}`,
      label: `${t("Manufacturability")}: ${label}`,
      onRemove: () => {
        const next = { ...router.query };
        delete next.manufacturability;
        // Manufacturability is represented by `show` (designs/products).
        delete next.show;
        pushQuery(next);
      },
    });
  } else if (show && show !== "all") {
    const showLabel = show === "services" ? t("Services") : show;
    chips.push({
      key: `show:${show}`,
      label: `${t("Show")}: ${showLabel}`,
      onRemove: () => {
        const next = { ...router.query };
        delete next.show;
        pushQuery(next);
      },
    });
  }

  for (const categoryTag of categoryTags) {
    const value = stripPrefix(categoryTag, TAG_PREFIX.CATEGORY);
    const decoded = (() => {
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    })();

    chips.push({
      key: `category:${categoryTag}`,
      label: humanizeSlug(decoded),
      onRemove: () => {
        const next = { ...router.query };
        const nextTags = rawTags.filter(tg => tg !== categoryTag);
        next.tags = nextTags.length > 0 ? nextTags.join(",") : undefined;
        pushQuery(next);
      },
    });
  }

  for (const tag of userTags) {
    const decoded = (() => {
      try {
        return decodeURIComponent(tag);
      } catch {
        return tag;
      }
    })();

    chips.push({
      key: `tag:${tag}`,
      label: decoded,
      onRemove: () => {
        const next = { ...router.query };
        const nextTags = rawTags.filter(tg => tg !== tag);
        next.tags = nextTags.length > 0 ? nextTags.join(",") : undefined;
        pushQuery(next);
      },
    });
  }

  for (const machineId of machines) {
    const machineName = machineNameById.get(machineId) || machineId;
    chips.push({
      key: `machine:${machineId}`,
      label: `${t("Machine")}: ${machineName}`,
      onRemove: () => {
        const next = { ...router.query };
        const nextMachines = removeFromCsvParam(next.machines as QueryValue, machineId);
        next.machines = nextMachines;

        const machineTag = machineNameById.has(machineId) ? prefixedTag(TAG_PREFIX.MACHINE, machineName) : null;
        if (machineTag) {
          const nextTags = rawTags.filter(tg => tg !== machineTag);
          next.tags = nextTags.length > 0 ? nextTags.join(",") : undefined;
        }

        pushQuery(next);
      },
    });
  }

  for (const material of materials) {
    chips.push({
      key: `material:${material}`,
      label: `${t("Material")}: ${material}`,
      onRemove: () => {
        const next = { ...router.query };
        const nextMaterials = removeFromCsvParam(next.materials as QueryValue, material);
        next.materials = nextMaterials;

        const materialTag = prefixedTag(TAG_PREFIX.MATERIAL, material);
        if (materialTag) {
          const nextTags = rawTags.filter(tg => tg !== materialTag);
          next.tags = nextTags.length > 0 ? nextTags.join(",") : undefined;
        }

        pushQuery(next);
      },
    });
  }

  for (const power of asCsvArray(router.query.power)) {
    chips.push({
      key: `power:${power}`,
      label: power,
      onRemove: () => {
        const next = { ...router.query };
        next.power = removeFromCsvParam(next.power as QueryValue, power);

        const powerCompatTag = prefixedTag(TAG_PREFIX.POWER_COMPAT, power);
        if (powerCompatTag) {
          const nextTags = rawTags.filter(tg => tg !== powerCompatTag);
          next.tags = nextTags.length > 0 ? nextTags.join(",") : undefined;
        }

        pushQuery(next);
      },
    });
  }

  const powerRequirementLabel = (() => {
    const min = powerMin ? `${powerMin}W` : "";
    const max = powerMax ? `${powerMax}W` : "";
    if (min && max) return `${min}–${max}`;
    if (min) return `≥${min}`;
    if (max) return `≤${max}`;
    return "";
  })();

  if (powerRequirementLabel) {
    chips.push({
      key: `powerRequirement:${powerMin}:${powerMax}`,
      label: `${t("Power Requirement")}: ${powerRequirementLabel}`,
      onRemove: () => {
        const next = { ...router.query };
        delete next.powerMin;
        delete next.powerMax;
        const nextTags = removeTagsByPrefix(rawTags, TAG_PREFIX.POWER_REQ);
        next.tags = nextTags.length > 0 ? nextTags.join(",") : undefined;
        pushQuery(next);
      },
    });
  }

  const energyLabel = (() => {
    const min = energyMin ? `${energyMin}kWh` : "";
    const max = energyMax ? `${energyMax}kWh` : "";
    if (min && max) return `${min}–${max}`;
    if (min) return `≥${min}`;
    if (max) return `≤${max}`;
    return "";
  })();

  if (energyLabel) {
    chips.push({
      key: `energy:${energyMin}:${energyMax}`,
      label: `${t("Energy")}: ${energyLabel}`,
      onRemove: () => {
        const next = { ...router.query };
        delete next.energyMin;
        delete next.energyMax;
        const nextTags = removeTagsByPrefix(rawTags, TAG_PREFIX.ENV_ENERGY);
        next.tags = nextTags.length > 0 ? nextTags.join(",") : undefined;
        pushQuery(next);
      },
    });
  }

  const co2Label = (() => {
    const min = co2Min ? `${co2Min}kg` : "";
    const max = co2Max ? `${co2Max}kg` : "";
    if (min && max) return `${min}–${max}`;
    if (min) return `≥${min}`;
    if (max) return `≤${max}`;
    return "";
  })();

  if (co2Label) {
    chips.push({
      key: `co2:${co2Min}:${co2Max}`,
      label: `${t("CO2")}: ${co2Label}`,
      onRemove: () => {
        const next = { ...router.query };
        delete next.co2Min;
        delete next.co2Max;
        const nextTags = removeTagsByPrefix(rawTags, TAG_PREFIX.ENV_CO2);
        next.tags = nextTags.length > 0 ? nextTags.join(",") : undefined;
        pushQuery(next);
      },
    });
  }

  for (const repl of asCsvArray(router.query.replicability)) {
    chips.push({
      key: `replicability:${repl}`,
      label: `${t("Replicability")}: ${t(repl)}`,
      onRemove: () => {
        const next = { ...router.query };
        next.replicability = removeFromCsvParam(next.replicability as QueryValue, repl);

        const replTag = prefixedTag(TAG_PREFIX.REPLICABILITY, repl);
        if (replTag) {
          const nextTags = rawTags.filter(tg => tg !== replTag);
          next.tags = nextTags.length > 0 ? nextTags.join(",") : undefined;
        }

        pushQuery(next);
      },
    });
  }

  const recyclabilityMin = asString(router.query.recyclabilityMin);
  const recyclabilityMax = asString(router.query.recyclabilityMax);

  const recyclabilityLabel = (() => {
    const min = recyclabilityMin ? `${recyclabilityMin}%` : "";
    const max = recyclabilityMax ? `${recyclabilityMax}%` : "";
    if (min && max) return `${min}–${max}`;
    if (min) return `≥${min}`;
    if (max) return `≤${max}`;
    return "";
  })();

  if (recyclabilityLabel) {
    chips.push({
      key: `recyclability:${recyclabilityMin}:${recyclabilityMax}`,
      label: `${t("Recyclability")}: ${recyclabilityLabel}`,
      onRemove: () => {
        const next = { ...router.query };
        delete next.recyclabilityMin;
        delete next.recyclabilityMax;
        const nextTags = removeTagsByPrefix(rawTags, TAG_PREFIX.RECYCLABILITY);
        next.tags = nextTags.length > 0 ? nextTags.join(",") : undefined;
        pushQuery(next);
      },
    });
  }

  if (asString(router.query.repairability) === "true") {
    chips.push({
      key: "repairability:true",
      label: t("Available for repair"),
      onRemove: () => {
        const next = { ...router.query };
        delete next.repairability;
        const nextTags = rawTags.filter(tg => tg !== REPAIRABILITY_AVAILABLE_TAG);
        next.tags = nextTags.length > 0 ? nextTags.join(",") : undefined;
        pushQuery(next);
      },
    });
  }

  return (
    <div className="mb-6 bg-white rounded-lg border border-[#C9CCCF] p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center justify-between md:justify-start gap-3">
          <p className="text-sm font-medium text-gray-900" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
            {t("Active filters")}
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-[#036A53] hover:underline"
            style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
          >
            {t("Clear all")}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {chips.map(chip => (
            <Tag key={chip.key} onRemove={chip.onRemove}>
              {chip.label}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  );
}
