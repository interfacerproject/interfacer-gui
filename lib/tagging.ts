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
  // Dedicated prefix for free-form, user-entered tags. All other prefixes are
  // system-derived metadata that happens to share the classifiedAs field.
  USER: "tag",
  CATEGORY: "category",
  MACHINE: "machine",
  MATERIAL: "material",
  POWER_COMPAT: "powercompat",
  POWER_REQ: "powerreq",
  REPLICABILITY: "replicability",
  RECYCLABILITY: "recyclability",
  REPAIRABILITY: "repairability",
  ENV_ENERGY: "env-energy",
  ENV_CO2: "env-co2",
  SERVICE_TYPE: "servicetype",
  AVAILABILITY: "availability",
  LICENSE: "license",
} as const;

export type TagPrefix = (typeof TAG_PREFIX)[keyof typeof TAG_PREFIX];

// All known system prefixes (everything except USER).
export const SYSTEM_TAG_PREFIXES: ReadonlyArray<string> = [
  TAG_PREFIX.CATEGORY,
  TAG_PREFIX.MACHINE,
  TAG_PREFIX.MATERIAL,
  TAG_PREFIX.POWER_COMPAT,
  TAG_PREFIX.POWER_REQ,
  TAG_PREFIX.REPLICABILITY,
  TAG_PREFIX.RECYCLABILITY,
  TAG_PREFIX.REPAIRABILITY,
  TAG_PREFIX.ENV_ENERGY,
  TAG_PREFIX.ENV_CO2,
  TAG_PREFIX.SERVICE_TYPE,
  TAG_PREFIX.AVAILABILITY,
  TAG_PREFIX.LICENSE,
];

// Legacy/stale system prefixes that still appear in historical classifiedAs data.
// These must not leak into user-facing tag displays.
export const LEGACY_SYSTEM_TAG_PATTERNS: ReadonlyArray<string> = [
  "power_compat-",
  "power_",
  "env_",
  "mat:",
  "c:",
  "pc:",
  "env:",
  "pwr:",
  "rep:",
  "m:",
];

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

export const SERVICE_TYPE_OPTIONS = ["Fabrication", "Learning & Education", "Space Access"] as const;

export const AVAILABILITY_OPTIONS = [
  "Available Now",
  "Booking Required",
  "Weekdays Only",
  "Weekends Available",
] as const;

// Recyclability uses a numeric percentage (0–100) stored with monotonic range tags,
// following the same pattern as energy consumption and CO2 emissions.
export const RECYCLABILITY_THRESHOLDS_PCT = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

// Repairability is a simple binary tag: either the product is repairable or not.
export const REPAIRABILITY_AVAILABLE_TAG = "repairability-available";

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
  recyclabilityPct?: number;
  repairability?: boolean;
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

  const recyclability =
    typeof filters.recyclabilityPct === "number"
      ? monotonicRangeTags(TAG_PREFIX.RECYCLABILITY, filters.recyclabilityPct, RECYCLABILITY_THRESHOLDS_PCT)
      : [];

  const repairability = filters.repairability ? [REPAIRABILITY_AVAILABLE_TAG] : [];

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

  return mergeTags(categories, powerCompatibility, replicability, recyclability, repairability, powerReq, energy, co2);
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

// ---------- User tag helpers ----------
//
// User-entered free-form tags are stored in classifiedAs alongside system-derived
// tags (machine-*, category-*, etc.). To disambiguate them we prefix every new
// user tag with `tag-`. Display and filter code should go through these helpers
// so there is a single source of truth and no drifting per-component blocklists.

// Build a canonical user tag from raw input. Returns undefined for empty values.
export function userTag(raw: string): string | undefined {
  const slug = slugifyTagValue(raw);
  if (!slug) return undefined;
  return `${TAG_PREFIX.USER}-${slug}`;
}

export function isUserTag(tag: string): boolean {
  return tag.startsWith(`${TAG_PREFIX.USER}-`);
}

export function stripUserTagPrefix(tag: string): string {
  return isUserTag(tag) ? tag.substring(TAG_PREFIX.USER.length + 1) : tag;
}

// A tag is "system" if it uses one of the known system prefixes (current or
// legacy). USER tags and legacy un-prefixed free-form tags are NOT system.
export function isSystemTag(tag: string): boolean {
  if (isUserTag(tag)) return false;
  if (SYSTEM_TAG_PREFIXES.some(p => tag.startsWith(`${p}-`))) return true;
  if (LEGACY_SYSTEM_TAG_PATTERNS.some(p => tag.startsWith(p))) return true;
  return false;
}

// Extract the values a user should see as "tags" from a classifiedAs list:
// - entries that match TAG_PREFIX.USER (stripped of the prefix)
// - legacy un-prefixed free-form entries (kept visible for backwards compat)
// System-prefixed entries are filtered out.
export function extractUserTagValues(tags: ReadonlyArray<string> | null | undefined): string[] {
  if (!tags || tags.length === 0) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const tag of tags) {
    if (!tag) continue;
    let value: string | undefined;
    if (isUserTag(tag)) {
      value = decodeURIComponent(stripUserTagPrefix(tag));
    } else if (!isSystemTag(tag)) {
      value = decodeURIComponent(tag);
    }
    if (!value) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

// Normalize raw user tag inputs (free-form strings, optionally already prefixed)
// into canonical `tag-<slug>` form. System-prefixed entries are dropped so they
// cannot accidentally ride in via the user-tag pipeline.
export function normalizeUserTagsForSave(tags: ReadonlyArray<string>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of tags) {
    const trimmed = raw?.trim();
    if (!trimmed) continue;
    if (isSystemTag(trimmed)) continue;
    const canonical = isUserTag(trimmed) ? trimmed : userTag(trimmed);
    if (!canonical) continue;
    if (seen.has(canonical)) continue;
    seen.add(canonical);
    out.push(canonical);
  }
  return out;
}
