/**
 * ResourceSpecification IDs for economic resources
 *
 * IMPORTANT: These are placeholder values. Replace with actual ULIDs from backend.
 *
 * To get actual IDs, query the backend:
 * ```graphql
 * query {
 *   resourceSpecifications {
 *     edges {
 *       node {
 *         id
 *         name
 *       }
 *     }
 *   }
 * }
 * ```
 *
 * Or ask backend team for:
 * - DPP ResourceSpecification ID
 * - Machine ResourceSpecification ID (just ONE spec for all machines)
 */

// DPP (Digital Product Passport) ResourceSpec
export const RESOURCE_SPEC_DPP = process.env.NEXT_PUBLIC_SPEC_DPP || "SPEC_DPP_PLACEHOLDER";

// Machine ResourceSpec (ONE spec for all machine types)
// Individual machines (Laser Cutter, 3D Printer, etc.) are EconomicResource instances
// that conform to this spec, differentiated by their name and metadata
export const RESOURCE_SPEC_MACHINE = process.env.NEXT_PUBLIC_SPEC_MACHINE || "SPEC_MACHINE_PLACEHOLDER";

/**
 * Machine types configuration
 * These are display names for UI - each represents an EconomicResource instance
 * that conforms to RESOURCE_SPEC_MACHINE
 */
export const MACHINE_TYPES = [
  {
    name: "Laser Cutter",
    icon: "laser", // Icon identifier for UI
  },
  {
    name: "3D Printer",
    icon: "printer-3d",
  },
  {
    name: "CNC Mill",
    icon: "cnc",
  },
  {
    name: "Solder Station",
    icon: "solder",
  },
  {
    name: "PCB Mill",
    icon: "pcb",
  },
  {
    name: "Vinyl Cutter",
    icon: "vinyl",
  },
  {
    name: "Reflow Oven",
    icon: "oven",
  },
] as const;

export type MachineType = (typeof MACHINE_TYPES)[number];
