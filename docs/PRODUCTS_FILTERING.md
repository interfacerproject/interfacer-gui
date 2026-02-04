# Products Page Filtering Implementation

## Overview

The products page (`/products`) implements filtering functionality using GraphQL queries with `EconomicResourceFilterParams`. This document explains the current implementation, limitations, and future enhancements needed.

## Current Implementation

### Supported Filters

The following filters are currently functional and integrated with the GraphQL backend:

1. **Search Query** (`?q=keyword`)

   - Uses `orName` filter parameter
   - Searches across project names
   - Example: `/products?q=laser`

2. **Tags** (`?tags=tag1,tag2`)

   - Uses `classifiedAs` filter parameter
   - Filters by resource classifications/tags
   - Example: `/products?tags=electronics,3dprinting`

3. **Location** (`?location=city`)

   - Uses `orNote` filter parameter (workaround)
   - Searches in project notes for location mentions
   - Example: `/products?location=Berlin`
   - **Note**: This is a temporary workaround. Proper location filtering requires spatial query support in the backend.

4. **Project Type** (`?conformsTo=id1,id2`)

   - Uses `conformsTo` filter parameter
   - Filters by resource specification IDs
   - Example: `/products?conformsTo=design,product`

5. **Contributors** (`?primaryAccountable=id1,id2`)
   - Uses `primaryAccountable` filter parameter
   - Filters by project owner/creator IDs
   - Example: `/products?primaryAccountable=user123`

### Implementation Details

**useFilters Hook** (`hooks/useFilters.ts`)

- Reads URL query parameters
- Transforms them to `EconomicResourceFilterParams` format
- Returns `proposalFilter` object for use in GraphQL queries

**products.tsx Page**

- Uses `useFilters()` hook to get filter parameters
- Passes `proposalFilter` to `ProjectsCards` component
- `ProjectsCards` executes `FETCH_RESOURCES` query with filters

**GraphQL Query** (`FETCH_RESOURCES` in `lib/QueryAndMutation.ts`)

```graphql
query FetchInventory($filter: EconomicResourceFilterParams) {
  economicResources(filter: $filter) {
    pageInfo {
      totalCount
    }
    edges {
      node {
        id
        name
        conformsTo {
          name
        }
        primaryAccountable {
          name
        }
        # ... other fields
      }
    }
  }
}
```

## Limitations & Future Enhancements

### Filters Requiring Backend Support

The following filters are captured in the URL but **NOT** applied to GraphQL queries because they require backend enhancements:

1. **Manufacturability** (`?manufacturability=can-manufacture,in-progress`)

   - Requires metadata field support
   - Should filter projects by manufacturing status
   - Backend needs: `metadata.manufacturability` field in GraphQL schema

2. **Machines Needed** (`?machines=3D Printer,CNC Mill`)

   - Requires metadata array field support
   - Should filter projects by required machine types
   - Backend needs: `metadata.machinesNeeded` array field

3. **Materials Needed** (`?materials=PLA,Aluminum`)

   - Requires metadata array field support
   - Should filter projects by required materials
   - Backend needs: `metadata.materialsNeeded` array field

4. **Power Compatibility** (`?power=AC,DC,Battery`)

   - Requires metadata array field support
   - Should filter projects by power requirements
   - Backend needs: `metadata.powerCompatibility` array field

5. **Power Requirement** (`?powerReq=Low,Medium,High`)

   - Requires metadata field support
   - Should filter by power consumption level
   - Backend needs: `metadata.powerRequirement` field

6. **Replicability** (`?replicability=High,Medium,Low`)
   - Requires metadata array field support
   - Should filter by ease of replication
   - Backend needs: `metadata.replicability` field

### Backend Enhancement Plan

To fully support products filtering, the backend should:

1. **Extend EconomicResource GraphQL Type**

   ```graphql
   type EconomicResource {
     # ... existing fields
     metadata: ProjectMetadata
   }

   type ProjectMetadata {
     manufacturability: String
     machinesNeeded: [String!]
     materialsNeeded: [String!]
     powerCompatibility: [String!]
     powerRequirement: String
     replicability: String
   }
   ```

2. **Extend EconomicResourceFilterParams Input**

   ```graphql
   input EconomicResourceFilterParams {
     # ... existing params
     manufacturability: [String!]
     machinesNeeded: [String!]
     materialsNeeded: [String!]
     powerCompatibility: [String!]
     powerRequirement: String
     replicability: [String!]
   }
   ```

3. **Implement Filtering Logic**

   - Add resolver logic to filter by metadata fields
   - Support array intersection for multi-value filters
   - Optimize queries for performance

4. **Spatial Filtering Enhancement**
   - Replace `orNote` workaround with proper spatial queries
   - Use `currentLocation` field for geographic filtering
   - Add radius/proximity search support

## Testing

### Manual Testing

Test each filter individually and in combination:

```bash
# Search
/products?q=laser

# Tags
/products?tags=electronics,3dprinting

# Location (current workaround)
/products?location=Berlin

# Combination
/products?q=printer&tags=electronics&location=Berlin

# Filters awaiting backend support (URLs work, but not applied)
/products?machines=3D Printer,CNC Mill
/products?materials=PLA,Aluminum
/products?power=AC,Battery
```

### Integration Points

1. **ProductsFilters Component** (`components/ProductsFilters.tsx`)

   - Updates URL query params when filters change
   - Uses `router.push({ pathname, query })` for shallow routing

2. **ProductsSearchBar Component** (`components/ProductsSearchBar.tsx`)

   - Updates `?q=` query param on search
   - Clears search with clear button

3. **useFilters Hook** (`hooks/useFilters.ts`)
   - Reads and parses all query params
   - Applies to `proposalFilter` where backend support exists

## Migration Path

When backend support is added:

1. Update `lib/types/index.ts` with new GraphQL types (run `pnpm codegen`)
2. Modify `useFilters` hook to include new filter params in `proposalFilter`
3. No changes needed in UI components (already managing URL params)
4. Test filters work end-to-end
5. Update this documentation

## Related Files

- `pages/products.tsx` - Main products page
- `components/ProductsFilters.tsx` - Filter sidebar UI
- `components/ProductsSearchBar.tsx` - Search input
- `hooks/useFilters.ts` - Filter query param handling
- `lib/QueryAndMutation.ts` - GraphQL queries
- `lib/types/index.ts` - Generated TypeScript types

## References

- ValueFlows EconomicResource spec: https://valueflo.ws/introduction/core.html#economicresource
- GraphQL filtering best practices: https://graphql.org/learn/queries/#arguments
