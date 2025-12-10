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
 * - Machine type ResourceSpecification IDs
 */

// DPP (Digital Product Passport) ResourceSpec
export const RESOURCE_SPEC_DPP = process.env.NEXT_PUBLIC_SPEC_DPP || "SPEC_DPP_PLACEHOLDER";

// Machine ResourceSpecs
export const RESOURCE_SPEC_MACHINE_LASER_CUTTER =
  process.env.NEXT_PUBLIC_SPEC_MACHINE_LASER_CUTTER || "SPEC_MACHINE_LASER_CUTTER_PLACEHOLDER";

export const RESOURCE_SPEC_MACHINE_3D_PRINTER =
  process.env.NEXT_PUBLIC_SPEC_MACHINE_3D_PRINTER || "SPEC_MACHINE_3D_PRINTER_PLACEHOLDER";

export const RESOURCE_SPEC_MACHINE_CNC_MILL =
  process.env.NEXT_PUBLIC_SPEC_MACHINE_CNC_MILL || "SPEC_MACHINE_CNC_MILL_PLACEHOLDER";

export const RESOURCE_SPEC_MACHINE_SOLDER_STATION =
  process.env.NEXT_PUBLIC_SPEC_MACHINE_SOLDER_STATION || "SPEC_MACHINE_SOLDER_STATION_PLACEHOLDER";

export const RESOURCE_SPEC_MACHINE_PCB_MILL =
  process.env.NEXT_PUBLIC_SPEC_MACHINE_PCB_MILL || "SPEC_MACHINE_PCB_MILL_PLACEHOLDER";

export const RESOURCE_SPEC_MACHINE_VINYL_CUTTER =
  process.env.NEXT_PUBLIC_SPEC_MACHINE_VINYL_CUTTER || "SPEC_MACHINE_VINYL_CUTTER_PLACEHOLDER";

export const RESOURCE_SPEC_MACHINE_REFLOW_OVEN =
  process.env.NEXT_PUBLIC_SPEC_MACHINE_REFLOW_OVEN || "SPEC_MACHINE_REFLOW_OVEN_PLACEHOLDER";

/**
 * Machine types configuration
 * Maps machine display names to their ResourceSpec IDs
 */
export const MACHINE_TYPES = [
  {
    id: RESOURCE_SPEC_MACHINE_LASER_CUTTER,
    name: "Laser Cutter",
    icon: "laser", // Icon identifier for UI
  },
  {
    id: RESOURCE_SPEC_MACHINE_3D_PRINTER,
    name: "3D Printer",
    icon: "printer-3d",
  },
  {
    id: RESOURCE_SPEC_MACHINE_CNC_MILL,
    name: "CNC Mill",
    icon: "cnc",
  },
  {
    id: RESOURCE_SPEC_MACHINE_SOLDER_STATION,
    name: "Solder Station",
    icon: "solder",
  },
  {
    id: RESOURCE_SPEC_MACHINE_PCB_MILL,
    name: "PCB Mill",
    icon: "pcb",
  },
  {
    id: RESOURCE_SPEC_MACHINE_VINYL_CUTTER,
    name: "Vinyl Cutter",
    icon: "vinyl",
  },
  {
    id: RESOURCE_SPEC_MACHINE_REFLOW_OVEN,
    name: "Reflow Oven",
    icon: "oven",
  },
] as const;

export type MachineType = (typeof MACHINE_TYPES)[number];
