/**
 * Tagging utilities — re-exports from @dyne/interfacer-client SDK.
 * Kept for backward compatibility with existing imports.
 */
export {
  slugifyTagValue,
  prefixedTag,
  userTag,
  isUserTag,
  stripUserTagPrefix,
  isSystemTag,
  extractUserTagValues,
  normalizeUserTagsForSave,
  monotonicRangeTags,
  rangeFilterTags,
  removeTagsWithPrefixes,
  derivedProductFilterTags,
  mergeTags,
  TAG_PREFIX,
  SYSTEM_TAG_PREFIXES,
  MANUFACTURABLE_TRUE_TAG,
  REPAIRABILITY_AVAILABLE_TAG,
  PRODUCT_CATEGORY_OPTIONS,
  POWER_COMPATIBILITY_OPTIONS,
  REPLICABILITY_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  AVAILABILITY_OPTIONS,
  RECYCLABILITY_THRESHOLDS_PCT,
  POWER_REQUIREMENT_THRESHOLDS_W,
  ENERGY_THRESHOLDS_KWH,
  CO2_THRESHOLDS_KG,
  COMPLEXITY_OPTIONS,
} from "@dyne/interfacer-client";
import { TAG_PREFIX as SDK_TAG_PREFIX } from "@dyne/interfacer-client";

// Complexity tag prefix, sourced from the SDK.
export const COMPLEXITY_PREFIX: string = SDK_TAG_PREFIX.COMPLEXITY;

// 1–5 complexity scale matching the Figma prototype's slider.
export interface ComplexityLevel {
  level: number;
  label: string;
  description: string;
}

export const COMPLEXITY_LEVELS: ComplexityLevel[] = [
  {
    level: 1,
    label: "Beginner",
    description: "Basic assembly with common tools; no soldering or programming required.",
  },
  {
    level: 2,
    label: "Easy",
    description: "A few simple skills needed: basic hand tools and straightforward assembly.",
  },
  {
    level: 3,
    label: "Moderate",
    description:
      "Multiple skills needed: electronics assembly, firmware configuration, and basic mechanical fabrication.",
  },
  {
    level: 4,
    label: "Advanced",
    description: "Specialized skills needed: PCB work, firmware development, and precision fabrication.",
  },
  {
    level: 5,
    label: "Expert",
    description: "Expert-level build: complex electronics, custom firmware, and advanced fabrication.",
  },
];

export const complexityLevelFromLabel = (label?: string): ComplexityLevel | undefined =>
  COMPLEXITY_LEVELS.find(l => l.label.toLowerCase() === (label || "").toLowerCase());

export const complexityLevelFromNumber = (n: number): ComplexityLevel =>
  COMPLEXITY_LEVELS.find(l => l.level === n) || COMPLEXITY_LEVELS[2];

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
