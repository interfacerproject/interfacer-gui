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
} from "@dyne/interfacer-client";

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
