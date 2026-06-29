# Geo Search for Economic Resources

Search for economic resources near a geographic point within a given radius.

## GraphQL API

Three new optional filter parameters have been added to the `economicResources` query:

| Parameter        | Type      | Description                                 |
| ---------------- | --------- | ------------------------------------------- |
| `nearLat`        | `Decimal` | Latitude of the center point (-90 to 90)    |
| `nearLong`       | `Decimal` | Longitude of the center point (-180 to 180) |
| `nearDistanceKm` | `Decimal` | Search radius in kilometers (must be > 0)   |

All three must be provided together. Omitting any one of them returns a validation error.

## Example Query

```graphql
query NearbyResources {
  economicResources(first: 20, filter: { nearLat: "41.9028", nearLong: "12.4964", nearDistanceKm: "50" }) {
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    edges {
      cursor
      node {
        id
        name
        note
        currentLocation {
          id
          name
          lat
          long
          mappableAddress
        }
      }
    }
  }
}
```

## Combining with Other Filters

Geo filters can be combined with any existing filter. For example, search for resources of a specific type near a point:

```graphql
query NearbyPlastics {
  economicResources(
    first: 10
    filter: { nearLat: "45.4642", nearLong: "9.1900", nearDistanceKm: "100", conformsTo: ["01GPXYZ..."], name: "PLA" }
  ) {
    edges {
      cursor
      node {
        id
        name
        conformsTo {
          id
          name
        }
        currentLocation {
          name
          lat
          long
        }
      }
    }
  }
}
```

## Behavior

- Only resources that have a `currentLocation` with non-null `lat` and `long` are returned. Resources without a location are excluded.
- Distance is calculated as great-circle distance (Haversine formula) in kilometers.
- Pagination (`first`/`after`/`last`/`before`) works as usual alongside the geo filter.

## Validation Errors

The API returns validation errors in these cases:

| Condition                                | Error                                                                         |
| ---------------------------------------- | ----------------------------------------------------------------------------- |
| Only 1 or 2 of the 3 geo params provided | `near_lat, near_long, and near_distance_km must all be provided together`     |
| `nearLat` outside [-90, 90]              | `must be greater than or equal to -90` / `must be less than or equal to 90`   |
| `nearLong` outside [-180, 180]           | `must be greater than or equal to -180` / `must be less than or equal to 180` |
| `nearDistanceKm` is 0 or negative        | `must be greater than 0`                                                      |
