// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { useQuery } from "lib/apollo-compat";
import { FETCH_RESOURCES } from "lib/QueryAndMutation";
import {
  EconomicResourceFilterParams,
  EconomicResourceSortField,
  EconomicResourceSortInput,
  FetchInventoryQuery,
  SortDirection,
} from "lib/types";
import useFilters from "hooks/useFilters";
import useLoadMore from "hooks/useLoadMore";
import { SEARCH_PEOPLE } from "./queries";
import { CATEGORY_PROJECT_TYPE, RESOURCE_CATEGORIES, SearchCategory } from "./constants";

export interface CategoryResult {
  items: Array<{ node: any }>;
  /** `null` means "not known yet" (specs or query still pending, or errored); `0` means "known to be zero". */
  count: number | null;
  loading: boolean;
  error?: Error;
  hasNext: boolean;
  loadMore: () => void;
  refetch: () => void;
}

interface Params {
  q: string;
  descriptionSearch: boolean;
  tags: string[];
  near?: { lat: string; long: string; distanceKm: string };
  sort: string;
}

// Mirrors CatalogLayout's SORT_MAP. "Relevance" == default order (no orderBy).
const SORT_MAP: Record<string, EconomicResourceSortInput | undefined> = {
  Relevance: undefined,
  "A–Z": { field: EconomicResourceSortField.Name, direction: SortDirection.Asc },
  "Z–A": { field: EconomicResourceSortField.Name, direction: SortDirection.Desc },
};

const LOSH_ID = process.env.NEXT_PUBLIC_LOSH_ID as string;
const PAGE_SIZE = 12;

/**
 * Raised when `useFilters` has finished loading but never resolved this category's
 * specification id — without it the category would silently look like "zero results".
 * Module-level so the identity is stable across renders.
 */
const SPECS_UNAVAILABLE_ERROR = new Error("category specs unavailable");

function buildResourceFilter(specId: string | undefined, p: Params): EconomicResourceFilterParams {
  return {
    conformsTo: specId ? [specId] : undefined,
    notCustodian: LOSH_ID ? [LOSH_ID] : undefined,
    ...(p.q && { orName: p.q }),
    ...(p.q && p.descriptionSearch && { orNote: p.q }),
    ...(p.tags.length > 0 && { classifiedAs: p.tags.map(t => encodeURI(t)) }),
    ...(p.near && {
      nearLat: p.near.lat,
      nearLong: p.near.long,
      nearDistanceKm: p.near.distanceKm,
    }),
  } as EconomicResourceFilterParams;
}

/** One economicResources query + its useLoadMore wiring. */
function useResourceCategory(specId: string | undefined, specsLoading: boolean, p: Params): CategoryResult {
  const filter = buildResourceFilter(specId, p);
  // Unknown sort values fall back to the default order instead of indexing off the map.
  const orderBy = Object.prototype.hasOwnProperty.call(SORT_MAP, p.sort) ? SORT_MAP[p.sort] : undefined;

  // "Not ready" (specs still resolving) is deliberately distinct from "no query":
  // the former means the count is not known yet, the latter that it is genuinely zero.
  const notReady = specsLoading || !specId;
  const noQuery = !p.q;
  const skip = notReady || noQuery;
  // Specs finished loading but this category's id never resolved — surface it as an
  // error rather than letting it read as an empty category.
  const specsFailed = !specsLoading && !specId && !noQuery;

  const { loading, data, fetchMore, refetch, variables, error } = useQuery<FetchInventoryQuery>(FETCH_RESOURCES, {
    variables: { last: PAGE_SIZE, filter, orderBy },
    skip,
  });

  const { loadMore, items, getHasNextPage } = useLoadMore({
    fetchMore,
    refetch,
    variables,
    data,
    dataQueryIdentifier: "economicResources",
  });

  if (specsFailed) {
    return {
      items: [],
      count: null,
      loading: false,
      error: SPECS_UNAVAILABLE_ERROR,
      hasNext: false,
      loadMore,
      refetch: () => refetch(),
    };
  }

  return {
    items: items ?? [],
    count: noQuery ? 0 : notReady ? null : data?.economicResources?.pageInfo?.totalCount ?? null,
    loading: (notReady && !noQuery) || (loading && !data && !noQuery),
    error: error as Error | undefined,
    hasNext: !!getHasNextPage,
    loadMore,
    refetch: () => refetch(),
  };
}

function usePeopleCategory(p: Params): CategoryResult {
  const noQuery = !p.q;
  const skip = noQuery;
  const { loading, data, fetchMore, refetch, variables, error } = useQuery<any>(SEARCH_PEOPLE, {
    variables: { last: PAGE_SIZE, userOrName: p.q },
    skip,
  });

  const { loadMore, items, getHasNextPage } = useLoadMore({
    fetchMore,
    refetch,
    variables,
    data,
    dataQueryIdentifier: "people",
  });

  return {
    items: items ?? [],
    count: noQuery ? 0 : data?.people?.pageInfo?.totalCount ?? null,
    loading: !noQuery && loading && !data,
    error: error as Error | undefined,
    hasNext: !!getHasNextPage,
    loadMore,
    refetch: () => refetch(),
  };
}

export function useSearchQueries(p: Params) {
  const { designId, productId, serviceId, machineId, specsLoading } = useFilters();

  const specIdByCategory: Record<(typeof RESOURCE_CATEGORIES)[number], string | undefined> = {
    designs: designId,
    products: productId,
    services: serviceId,
    machines: machineId,
  };

  const designs = useResourceCategory(designId, specsLoading, p);
  const products = useResourceCategory(productId, specsLoading, p);
  const services = useResourceCategory(serviceId, specsLoading, p);
  const machines = useResourceCategory(machineId, specsLoading, p);
  const people = usePeopleCategory(p);

  const byCategory: Record<SearchCategory, CategoryResult> = {
    designs,
    products,
    services,
    machines,
    people,
  };

  const counts = [designs.count, products.count, services.count, machines.count, people.count];
  const totalCount = counts.every(c => typeof c === "number") ? (counts as number[]).reduce((a, b) => a + b, 0) : null;

  // Referenced so lint doesn't flag the unused map; also handy for the /search "All" map union.
  void specIdByCategory;
  void CATEGORY_PROJECT_TYPE;

  return { byCategory, totalCount, specsLoading };
}
