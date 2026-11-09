// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// The Zenflows side of marketplace cards: name, owner and images of the
// resources behind listings and catalog entries, in one query.

import { useMemo } from "react";
import { useQuery } from "lib/apollo-compat";
import findProjectImages from "lib/findProjectImages";

const MARKET_RESOURCES = `query MarketResources($ids: [ID!], $first: Int) {
  economicResources(first: $first, filter: { id: $ids }) {
    edges { node {
      id name note metadata
      images { hash name mimeType bin }
      primaryAccountable { id name }
      currentLocation { name }
    } }
  }
}`;

export interface MarketResource {
  id: string;
  name: string;
  note?: string | null;
  owner?: { id: string; name: string } | null;
  location?: string | null;
  image?: string | null;
}

export function useMarketResources(ids: string[]): { resources: Record<string, MarketResource>; loading: boolean } {
  const unique = useMemo(() => Array.from(new Set(ids)).sort(), [ids]);
  const { data, loading } = useQuery<any>(MARKET_RESOURCES, {
    variables: { ids: unique, first: Math.max(unique.length, 1) },
    skip: unique.length === 0,
  });
  const resources = useMemo(() => {
    const out: Record<string, MarketResource> = {};
    for (const edge of data?.economicResources?.edges ?? []) {
      const node = edge.node;
      out[node.id] = {
        id: node.id,
        name: node.name,
        note: node.note,
        owner: node.primaryAccountable ?? null,
        location: node.currentLocation?.name ?? null,
        image: findProjectImages(node)[0] ?? null,
      };
    }
    return out;
  }, [data]);
  return { resources, loading: unique.length > 0 && loading };
}
