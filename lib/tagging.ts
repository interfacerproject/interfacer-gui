export function slugifyTagValue(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export const TAG_PREFIX = {
  CATEGORY: "category",
  MACHINE: "machine",
  MATERIAL: "material",
  POWER_COMPAT: "powercompat",
  POWER_REQ: "powerreq",
  REPLICABILITY: "replicability",
  ENV_ENERGY: "env-energy",
  ENV_CO2: "env-co2",
} as const;

export type TagPrefix = (typeof TAG_PREFIX)[keyof typeof TAG_PREFIX];

// Shared option lists used across create flow + products filters.
export const PRODUCT_CATEGORY_OPTIONS = [
  "Electronics",
  "Tools",
  "Furniture",
  "Home renovation",
  "Energy",
  "Wearables",
  "Medical",
  "Sustainability",
  "Education",
] as const;

export const POWER_COMPATIBILITY_OPTIONS = [
  "120V AC",
  "220-240V AC",
  "12V DC",
  "24V DC",
  "Battery Powered",
  "USB-C",
] as const;

export const REPLICABILITY_OPTIONS = ["High", "Medium", "Low"] as const;

// Numeric thresholds used for monotonic range tags.
// Keep these lists stable: changing them will change the derived tags.
export const POWER_REQUIREMENT_THRESHOLDS_W = [
  0, 10, 25, 50, 75, 100, 150, 200, 250, 300, 500, 750, 1000, 1500, 2000,
] as const;

export const ENERGY_THRESHOLDS_KWH = [0, 10, 20, 30, 50, 100, 200, 300, 500, 750, 1000, 1500, 2000] as const;

export const CO2_THRESHOLDS_KG = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 5, 7.5, 10, 15, 20] as const;

export interface ProductFilterMetadata {
  categories?: string[];
  powerCompatibility?: string[];
  replicability?: string[];
  powerRequirementW?: number;
  energyKwh?: number;
  co2Kg?: number;
}

export function formatNumericTagValue(value: number): string {
  if (!Number.isFinite(value)) return "";
  // Use a deterministic encoding for decimals, avoiding '.' which could be ambiguous after slugging.
  // Examples: 0.5 -> 0p5, 7.5 -> 7p5
  const normalized = Number.isInteger(value) ? String(value) : String(value).replace(/\./g, "p");
  return normalized.replace(/[^0-9p-]/g, "");
}

function asSortedNumericThresholds(thresholds: ReadonlyArray<number>): number[] {
  return Array.from(new Set(thresholds.filter(n => Number.isFinite(n)))).sort((a, b) => a - b);
}

export function isPrefixedTag(tag: string, prefixes: ReadonlyArray<string>): boolean {
  return prefixes.some(prefix => tag.startsWith(`${prefix}-`));
}

export function monotonicRangeTags(prefix: string, value: number, thresholds: ReadonlyArray<number>): string[] {
  if (!Number.isFinite(value)) return [];
  const sorted = asSortedNumericThresholds(thresholds);
  const ge = sorted.filter(t => t <= value).map(t => `${prefix}-ge-${formatNumericTagValue(t)}`);
  const le = sorted.filter(t => t >= value).map(t => `${prefix}-le-${formatNumericTagValue(t)}`);
  return mergeTags(ge, le);
}

export function rangeFilterTags(
  prefix: string,
  minValue: number | undefined,
  maxValue: number | undefined,
  thresholds: ReadonlyArray<number>
): string[] {
  const sorted = asSortedNumericThresholds(thresholds);

  const tags: string[] = [];

  if (typeof minValue === "number" && Number.isFinite(minValue)) {
    const lower = sorted.reduce<number | undefined>((acc, t) => (t <= minValue ? t : acc), undefined);
    if (typeof lower === "number") tags.push(`${prefix}-ge-${formatNumericTagValue(lower)}`);
  }

  if (typeof maxValue === "number" && Number.isFinite(maxValue)) {
    const upper = sorted.find(t => t >= maxValue);
    if (typeof upper === "number") tags.push(`${prefix}-le-${formatNumericTagValue(upper)}`);
  }

  return mergeTags(tags);
}

export function derivedProductFilterTags(filters: ProductFilterMetadata): string[] {
  const categories = (filters.categories || [])
    .map(value => prefixedTag(TAG_PREFIX.CATEGORY, value))
    .filter((t): t is string => Boolean(t));

  const powerCompatibility = (filters.powerCompatibility || [])
    .map(value => prefixedTag(TAG_PREFIX.POWER_COMPAT, value))
    .filter((t): t is string => Boolean(t));

  const replicability = (filters.replicability || [])
    .map(value => prefixedTag(TAG_PREFIX.REPLICABILITY, value))
    .filter((t): t is string => Boolean(t));

  const powerReq =
    typeof filters.powerRequirementW === "number"
      ? monotonicRangeTags(TAG_PREFIX.POWER_REQ, filters.powerRequirementW, POWER_REQUIREMENT_THRESHOLDS_W)
      : [];

  const energy =
    typeof filters.energyKwh === "number"
      ? monotonicRangeTags(TAG_PREFIX.ENV_ENERGY, filters.energyKwh, ENERGY_THRESHOLDS_KWH)
      : [];

  const co2 =
    typeof filters.co2Kg === "number" ? monotonicRangeTags(TAG_PREFIX.ENV_CO2, filters.co2Kg, CO2_THRESHOLDS_KG) : [];

  return mergeTags(categories, powerCompatibility, replicability, powerReq, energy, co2);
}

export function removeTagsWithPrefixes(tags: ReadonlyArray<string>, prefixes: ReadonlyArray<string>): string[] {
  return tags.filter(tag => !isPrefixedTag(tag, prefixes));
}

export function prefixedTag(prefix: string, value: string): string | undefined {
  const slug = slugifyTagValue(value);
  if (!slug) return undefined;
  return `${prefix}-${slug}`;
}

export function mergeTags(...tagLists: Array<ReadonlyArray<string> | undefined>): string[] {
  const merged: string[] = [];
  const seen = new Set<string>();

  for (const list of tagLists) {
    if (!list) continue;
    for (const tag of list) {
      const trimmed = tag.trim();
      if (!trimmed) continue;
      if (seen.has(trimmed)) continue;
      seen.add(trimmed);
      merged.push(trimmed);
    }
  }

  return merged;
}
