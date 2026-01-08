/**
 * ResourceSpecification IDs for economic resources
 *
 * @deprecated These constants are deprecated. Use instanceVariables.specs from backend instead.
 *
 * Backend now provides specs via GraphQL query:
 * ```graphql
 * query {
 *   instanceVariables {
 *     specs {
 *       specDpp { id name }
 *       specMachine { id name }
 *       specMaterial { id name }
 *     }
 *   }
 * }
 * ```
 *
 * Use the QUERY_PROJECT_TYPES or QUERY_VARIABLES query to fetch these IDs.
 */

/**
 * @deprecated Use instanceVariables.specs.specDpp.id instead
 */
export const RESOURCE_SPEC_DPP = process.env.NEXT_PUBLIC_SPEC_DPP || "";

/**
 * @deprecated Use instanceVariables.specs.specMachine.id instead
 */
export const RESOURCE_SPEC_MACHINE = process.env.NEXT_PUBLIC_SPEC_MACHINE || "";

/**
 * @deprecated Use instanceVariables.specs.specMaterial.id instead
 */
export const RESOURCE_SPEC_MATERIAL = process.env.NEXT_PUBLIC_SPEC_MATERIAL || "";

/**
 * Machine types configuration
 * These are display names for UI - each represents an EconomicResource instance
 * that conforms to specMachine ResourceSpecification
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
