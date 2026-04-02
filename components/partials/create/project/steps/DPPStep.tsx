// Re-export types and schema for backward compatibility
export { dppStepDefaultValues, dppStepSchema } from "./DPPStep/schema";
export type { DPPStepValues } from "./DPPStep/types";

// This component is no longer used in the project creation form.
// DPP creation is now handled by the standalone CreateDppForm at /dpps/new.
// The DPPStep/* sub-modules (schema, types, sections, components) are still
// imported directly by CreateDppForm.
