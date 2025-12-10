# Project Creation Architecture Refactor

**Date**: 2025-12-10  
**Epic**: interfacer-gui-9lv  
**Priority**: Critical (P0)

## Overview

This document describes a fundamental architectural change to how projects are created and how Digital Product Passports (DPP) and machine requirements are stored in the Interfacer system.

**Key Changes:**

1. DPP changes from metadata ULID reference → cited economic resource
2. Machines introduced as cited economic resources (new feature)
3. Form UI updated to match new Figma design with machines selection

## Current Architecture (Before)

### DPP Storage Flow

```
User submits form
  ↓
processDppValues() processes DPP data & uploads files
  ↓
POST to interfacer-dpp service → returns ULID
  ↓
handleProjectCreation(formData, projectType, dppUlid)
  ↓
metadata: JSON.stringify({ dpp: dppUlid, ... })
  ↓
CREATE_PROJECT mutation with metadata field
  ↓
Project EconomicResource created with DPP ULID in metadata
```

**Code Location**: `hooks/useProjectCRUD.ts` line 237

```typescript
metadata: JSON.stringify({
  contributors: formData.contributors,
  licenses: formData.licenses,
  relations: formData.relations,
  declarations: formData.declarations,
  remote: location?.remote,
  design: design,
  dpp: dppUlid,  // ← Currently stored as ULID in metadata
}),
```

**Problems:**

- DPP is not a proper economic resource, just a reference
- Cannot query/filter projects by DPP properties
- Violates ValueFlows model - relationships should use cite events
- No way to track DPP lifecycle or dependencies

### Machine Requirements

**Current State**: Not implemented. Machines are not tracked at all.

## New Architecture (After)

### DPP as Cited Economic Resource

```
User submits form
  ↓
processDppValues() processes DPP data & uploads files
  ↓
POST to interfacer-dpp service → returns ULID
  ↓
handleProjectCreation(formData, projectType, dppUlid)
  ↓
CREATE DPP EconomicResource with:
  - resourceSpec: DPP spec ID
  - metadata: { dppServiceUlid: dppUlid }
  ↓
Get DPP EconomicResource ID
  ↓
CITE_PROJECT mutation: project → DPP resource
  ↓
Project cites DPP via economic event
```

**Benefits:**

- DPP is proper economic resource in ValueFlows model
- Can query all projects citing specific DPP
- Can track DPP lifecycle (created, updated, versioned)
- Proper dependency graph via cite events

### Machines as Cited Economic Resources

```
User selects machines (Laser Cutter, 3D Printer, etc.)
  ↓
handleProjectCreation receives machine IDs
  ↓
For each machine:
  CITE_PROJECT mutation: project → machine resource
  ↓
Project cites each required machine
```

**Machine Data Model:**

- Machines are global EconomicResource instances
- Each machine type has a ResourceSpecification (e.g., "Laser Cutter")
- Machines can be:
  - Generic types (e.g., "Any 3D Printer")
  - Specific instances (e.g., "Prusa MK4 at FabLab Berlin")
- Citing machines enables:
  - Finding projects by required machines
  - Finding machines by compatible projects
  - Makerspace resource planning

### Updated Metadata Schema

```typescript
metadata: JSON.stringify({
  contributors: formData.contributors,
  licenses: formData.licenses,
  relations: formData.relations,
  declarations: formData.declarations,
  remote: location?.remote,
  design: design,
  // dpp: REMOVED - now cited resource
  // machines: REMOVED - now cited resources
}),
```

## GraphQL Changes

### New Mutations Needed

#### 1. Create DPP Economic Resource

```graphql
mutation CreateDppResource($spec: ID!, $agent: ID!, $dppUlid: String!) {
  createEconomicEvent(
    event: {
      action: "produce"
      provider: $agent
      receiver: $agent
      resourceConformsTo: $spec
      resourceMetadata: "{\"dppServiceUlid\": \"${dppUlid}\"}"
    }
  ) {
    economicEvent {
      resourceInventoriedAs {
        id
      }
    }
  }
}
```

#### 2. Cite DPP from Project

Already exists - use `CITE_PROJECT` mutation:

```graphql
mutation citeProject($resource: ID!, $process: ID!, ...) {
  createEconomicEvent(
    event: {
      action: "cite"
      inputOf: $process
      resourceInventoriedAs: $resource  # DPP resource ID
      # ...
    }
  )
}
```

#### 3. Query Projects by Machine

```graphql
query ProjectsByMachine($machineId: ID!) {
  economicResource(id: $machineId) {
    track {
      # Events citing this machine
      economicEvent {
        outputOf {
          # Project creation processes
        }
      }
    }
  }
}
```

### ResourceSpecification IDs Needed

Need backend to create specs for:

- **DPP**: `spec_dpp` or similar
- **Machines**:
  - `spec_machine_laser_cutter`
  - `spec_machine_3d_printer`
  - `spec_machine_cnc_mill`
  - `spec_machine_solder_station`
  - etc.

## UI Changes (Figma Design)

**Figma Reference**: node-id=348-17380

### New Form Sections

#### 1. Machines Needed (Priority 0)

- **Toggle**: Enable/disable section
- **Search Input**: Type to search machines with autocomplete
- **Selected Machines**: Display as chips (like tags) with remove button
- **Machine Icons**: Each machine type has icon
- **Example**: "Laser Cutter" and "3D Printer" chips shown

**Component**: `components/partials/create/project/steps/MachinesStep.tsx`

#### 2. Power Requirements (Priority 2 - Optional)

- Multiple checkboxes: 110V AC, 230V AC, 12V DC, 5V DC, Battery, USB-C PD, Solar
- Slider: Power consumption in Watts (0-1500W)

#### 3. Materials (Priority 2 - Optional)

- Checkboxes: PLA, ABS, PETG, Aluminum, Steel, Wood, Acrylic, Resin, Plywood, Silicone, Carbon Fiber

#### 4. Manufacturing & Repair (Priority 2 - Optional)

- Toggle: "Manufacturing Available"
- Toggle: "Repair Info Available"

#### 5. Environmental Impact (Priority 2 - Optional)

- Sliders:
  - Energy Consumption (kWh)
  - Recyclability (%)
  - CO2 Emissions per unit (kg)

### Form Flow

```
General Info (existing)
  ↓
Categories & Type (existing)
  ↓
**Machines Needed** (NEW - P0)
  ↓
Power Requirements (NEW - P2)
  ↓
Materials (NEW - P2)
  ↓
Manufacturing & Repair (NEW - P2)
  ↓
Environmental Impact (NEW - P2)
  ↓
Location (existing)
  ↓
Design Info (existing)
  ↓
Upload Pictures (existing)
  ↓
Related Projects (existing)
```

## Implementation Plan

### Phase 1: Core Architecture (P0)

**Tasks:**

1. ✅ `interfacer-gui-9lv.1`: Document architecture (this file)
2. ⏳ `interfacer-gui-9lv.2`: Define DPP ResourceSpec + mutations
3. ⏳ `interfacer-gui-9lv.3`: Define machines ResourceSpec + data model
4. ⏳ `interfacer-gui-9lv.5`: Refactor DPP upload to create economic resource
5. ⏳ `interfacer-gui-9lv.7`: Update metadata schema (remove dpp field)

### Phase 2: Machines Integration (P1)

**Tasks:** 6. ⏳ `interfacer-gui-9lv.4`: Create machines selection UI component 7. ⏳ `interfacer-gui-9lv.6`: Add machines to project creation flow 8. ⏳ `interfacer-gui-9lv.9`: Test DPP as cited resource 9. ⏳ `interfacer-gui-9lv.10`: Test machines citation

### Phase 3: UI Polish (P2)

**Tasks:** 10. ⏳ `interfacer-gui-9lv.8`: Update CreateProjectForm with all Figma sections 11. ⏳ `interfacer-gui-9lv.11`: Update project detail page

## Data Migration Considerations

### Backward Compatibility

**Legacy Projects**: Projects created before this change have DPP in metadata.

**Retrieval Strategy**:

```typescript
async function getDppForProject(project: EconomicResource) {
  // Try new way first: query cited resources
  const citedDpp = await queryCitedResources(project.id, "spec_dpp");
  if (citedDpp) return citedDpp;

  // Fall back to metadata
  const metadata = JSON.parse(project.metadata);
  if (metadata.dpp) {
    return { dppServiceUlid: metadata.dpp };
  }

  return null;
}
```

**Migration**: Not required immediately. Old projects work via fallback. Optional migration script can convert metadata DPP → cited resource.

## Breaking Changes

### Frontend

- **CreateProjectValues type**: Add `machines: string[]` field
- **Metadata parsing**: Remove `dpp` field expectation
- **DPP retrieval**: Use cite events instead of metadata

### Backend

- **ResourceSpecification**: Need specs for DPP and machines
- **Queries**: May need new queries to efficiently get cited resources

### Integration

- **interfacer-dpp service**: No changes needed - still stores DPP data
- **Link**: DPP ULID now stored in DPP resource metadata instead of project metadata

## Testing Strategy

### Unit Tests

- `useProjectCRUD.handleProjectCreation`: Test DPP resource creation
- `useProjectCRUD.addRelation`: Test machine citation
- Form validation: Test machines field

### Integration Tests

1. Create project with DPP → verify DPP resource created + cited
2. Create project with machines → verify cite events for each machine
3. Query project → retrieve cited DPP and machines
4. Legacy project → fallback to metadata DPP works
5. DPP creation failure → graceful error handling

### E2E Tests (Playwright/Cypress)

1. Full project creation flow with machines selection
2. Machine autocomplete search
3. Remove selected machine
4. Project detail page displays machines

## Dependencies

### Backend Team

- Create ResourceSpecification for DPP
- Create ResourceSpecifications for machine types
- Review/approve GraphQL mutation approach
- Verify cite event query performance

### Design Team

- Finalize machine icons
- Confirm materials/power/environmental sections priority
- Review component implementation vs Figma

## Rollout Plan

### Stage 1: Development (Current)

- Implement core architecture
- Test with dev data

### Stage 2: Staging

- Migrate staging database (optional)
- Full E2E testing
- User acceptance testing

### Stage 3: Production

- Feature flag: `ENABLE_DPP_AS_RESOURCE`
- Gradual rollout
- Monitor cite event creation
- Watch for errors

### Stage 4: Cleanup

- Remove fallback code after X months
- Remove feature flag
- Archive old metadata DPP handling

## Success Metrics

- ✅ All new projects have DPP as cited resource
- ✅ Machine selection works with autocomplete
- ✅ Projects searchable by required machines
- ✅ Zero errors in production rollout
- ✅ DPP retrieval performance acceptable (<500ms)
- ✅ Legacy projects still display DPP correctly

## References

- **ValueFlows**: https://valueflo.ws/
- **Economic Resource**: https://valueflo.ws/introduction/core.html#EconomicResource
- **Cite Action**: https://valueflo.ws/introduction/flows.html#cite
- **Figma Design**: https://www.figma.com/design/fZm62oTpY4srzipfiBQ1vR/DTEC---Prototypes?node-id=348-17380
- **interfacer-dpp Service**: External microservice at NEXT_PUBLIC_DPP_URL

## Contact

For questions about this refactor:

- Architecture: Review this document + `hooks/useProjectCRUD.ts`
- UI Implementation: See Figma design node-id=348-17380
- Backend coordination: Sync with Zenflows team on ResourceSpec IDs
