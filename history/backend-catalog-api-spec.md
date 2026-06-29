# Backend API Requirements for Catalog Pages

## Context

The frontend (`interfacer-gui`) has three catalog pages — `/designs`, `/products`, `/services` — each querying `economicResources` via GraphQL. Two capabilities are missing from the backend:

1. **Sorting** — the UI captures a sort preference but has no way to send it to the API
2. **Aggregation stats** — hero stat cards need counts the current API cannot provide

### Existing query

```graphql
query FetchInventory($first: Int, $after: ID, $last: Int, $before: ID, $filter: EconomicResourceFilterParams) {
  economicResources(first: $first, after: $after, before: $before, last: $last, filter: $filter) {
    pageInfo { startCursor endCursor hasPreviousPage hasNextPage totalCount pageLimit }
    edges { cursor node { ... } }
  }
}
```

### Existing `EconomicResourceFilterParams` fields

`classifiedAs`, `conformsTo`, `orConformsTo`, `custodian`, `notCustodian`, `primaryAccountable`, `notPrimaryAccountable`, `name`, `orName`, `note`, `orNote`, `repo`, `orRepo`, `id`, `orId`, `nearLat`, `nearLong`, `nearDistanceKm`, `gtOnhandQuantityHasNumericalValue`, `orGtOnhandQuantityHasNumericalValue`, `orClassifiedAs`, `orCustodian`.

Resources are typed by `conformsTo` pointing to a resource specification ID (design, product, or service spec). Each resource has a `primaryAccountable` (the creator/manufacturer agent).

---

## Requirement 1 — Sorting (`orderBy` parameter)

Add an `orderBy` (or `sort`) parameter to the `economicResources` query so the frontend can request server-side sorting.

### Proposed schema addition

```graphql
enum EconomicResourceSortField {
  CREATED_AT # creation timestamp (for "Latest" / "Oldest")
  NAME # alphabetical (for "A–Z" / "Z–A")
}

enum SortDirection {
  ASC
  DESC
}

input EconomicResourceSortInput {
  field: EconomicResourceSortField!
  direction: SortDirection!
}
```

### Updated query signature

```graphql
economicResources(
  first: Int, after: ID, last: Int, before: ID,
  filter: EconomicResourceFilterParams,
  orderBy: EconomicResourceSortInput    # ← NEW
): EconomicResourceConnection!
```

### Frontend sort options and their expected mappings

| UI label | `field`      | `direction` |
| -------- | ------------ | ----------- |
| Latest   | `CREATED_AT` | `DESC`      |
| Oldest   | `CREATED_AT` | `ASC`       |
| A–Z      | `NAME`       | `ASC`       |
| Z–A      | `NAME`       | `DESC`      |

> **Deferred:** "Most Popular" requires a popularity metric (view count, star count, etc.) that doesn't exist yet. Will be specified separately once the underlying data model is defined.

### Default behavior

When `orderBy` is omitted, keep current behavior (presumably insertion order or latest first).

---

## Requirement 2 — Aggregation stats for hero cards

Each catalog page displays three stat cards in its hero section. The first card (`totalCount`) is already wired from `pageInfo.totalCount`. The remaining two cards per page need new data.

### Option A (preferred) — Extend `pageInfo` with aggregation fields

Return additional counts alongside the existing `totalCount` in the connection response, scoped to the current `filter`. This avoids extra round-trips.

```graphql
type EconomicResourcePageInfo {
  # ... existing fields ...
  totalCount: Int!

  # NEW aggregation fields
  distinctPrimaryAccountableCount: Int # unique manufacturers/providers
}
```

### Option B — Separate aggregation query

```graphql
type EconomicResourceAggregation {
  totalCount: Int!
  distinctPrimaryAccountableCount: Int!
}

economicResourceAggregation(filter: EconomicResourceFilterParams): EconomicResourceAggregation!
```

### What each page needs

| Page        | Card 1 (done ✅)              | Card 2                                                                                      | Card 3                                                                                                        |
| ----------- | ----------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `/designs`  | `totalCount` (Open Designs)   | Count of design resources that have ≥1 linked product resource → **"Available as Product"** | `distinctPrimaryAccountableCount` where `conformsTo = productSpec` → **"Manufacturers"**                      |
| `/products` | `totalCount` (Total Products) | Count where `onhandQuantity > 0` → **"Available Now"**                                      | `distinctPrimaryAccountableCount` → **"Manufacturers"**                                                       |
| `/services` | `totalCount` (Total Services) | `distinctPrimaryAccountableCount` → **"Service Providers"**                                 | Sum/count of resources with `conformsTo = machineSpec` linked to service providers → **"Machines Available"** |

### Minimum viable scope

If cross-resource-type counts (card 2 on designs, card 3 on services) are complex, start with just `distinctPrimaryAccountableCount` on the connection — that alone unblocks:

- **"Manufacturers"** on designs and products pages
- **"Service Providers"** on services page

The remaining cards can show "—" until the more complex aggregations are implemented.

---

## Summary of deliverables (priority order)

1. **`orderBy` parameter** on `economicResources` query — supports `CREATED_AT` and `NAME` with `ASC`/`DESC`
2. **`distinctPrimaryAccountableCount`** on the connection `pageInfo` (or via separate query) — filtered by the same `filter` input
3. _(Nice-to-have)_ Cross-type aggregation counts for the remaining stat cards

## Frontend integration plan

Once these are available, the frontend will:

- Pass `orderBy: { field, direction }` from the sort dropdown
- Read `distinctPrimaryAccountableCount` from the response and display it in the appropriate hero stat card
- Wire remaining cards as aggregation endpoints become available
