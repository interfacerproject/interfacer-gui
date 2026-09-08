# Search Results Page Rework — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/search` as a token-driven, five-category faceted search surface (Designs, Products, Services, Machines, People) with a grouped "All" view, shared filters, and a map toggle — visually consistent with the reworked `/products`, `/designs`, `/services`.

**Architecture:** `pages/search.tsx` becomes a thin page shell. All logic lives in new components under `components/search/`. A `useSearchQueries` hook fires five GraphQL queries in parallel on mount (four `FETCH_RESOURCES` keyed by `conformsTo` spec ID, one `SEARCH_PEOPLE`) to feed live tab counts. State (active category, list/map view, filters) lives in the URL query string. `CatalogLayout` and `CatalogFilterSidebar` are **not** touched; leaf components (`ProjectCardNew`, `ProjectsMaps`, `ToolbarDropdown`, `ProductCardSkeleton`, `EmptyState`, `BrUserAvatar`, `EntityTypeIcon`) and the `useLoadMore` hook are reused.

**Tech Stack:** Next.js 14 (pages router), TypeScript, Apollo Client (via `lib/apollo-compat`), `@dyne/interfacer-client` GraphQL documents, Tailwind + `--ifr-*` CSS custom properties, `next-i18next`, Playwright for e2e smoke.

**Spec:** `docs/superpowers/specs/2026-09-08-search-results-page-rework-design.md` — read it alongside this plan.

## Global Constraints

- **No component test runner exists in this repo** (only Playwright e2e + Cypress). Do NOT add Jest/vitest/RTL. Per project convention (PRs #889, #893), each task's verification is: `pnpm check-types` clean, `pnpm check-lint` clean on touched files, a concrete manual check in the running dev app, and — where stated — an assertion in `tests/render_nru.spec.ts`. "Write the failing test" steps below are Playwright/manual checks, not unit tests.
- **`components/CatalogLayout.tsx` and `components/CatalogFilterSidebar.tsx` must not be modified.** `/products`, `/designs`, `/services` must render identically before and after this work.
- **i18n:** every user-visible string goes through `t()` (the `i18next` eslint rule enforces this). Add new keys to all four shipped locales: `public/locales/{en,de,fr,it}/common.json`. Keys are English sentences; a missing translation falls back to the key.
- **License header:** every new `.ts`/`.tsx` file starts with the AGPL header block used across the repo (copy from `components/CatalogLayout.tsx` lines 1-2, or the longer form from `components/EmptyState.tsx`'s siblings — the 2-line `// SPDX-License-Identifier: AGPL-3.0-or-later` + `// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.` is acceptable and is what `CatalogLayout.tsx` uses).
- **Design tokens:** use `--ifr-*` tokens / `ifr-*` Tailwind utilities. No hardcoded hex except inside `styles/theme.css`.
- **Entity accent colours:** Design `--ifr-green`, Product `--ifr-type-product`, Service `--ifr-type-service`, Machine `--ifr-type-machine` (new, `#475569`), People has no hue (uses `--ifr-text-primary` for its tab swatch).
- **URL params** (all optional): `q`, `cat` (`all|designs|products|services|machines|people`, default `all`), `view` (`list|map`, default `list`), `sort` (`Relevance|A–Z|Z–A`, default `Relevance`), `desc` (`0` disables description search), `tags` (comma slugs), `nearLat`, `nearLong`, `nearDistanceKm`, `locationLabel`. All navigation via `router.push({ pathname, query }, undefined, { shallow: true })`.
- **Commit style:** repo uses Conventional Commits (`feat(search): …`, `fix(search): …`, `chore(search): …`). Commit at the end of every task.

---

## File Structure

**Create:**

- `components/search/constants.ts` — `SearchCategory` type, ordered list, label keys, accent map.
- `components/search/queries.ts` — local `SEARCH_PEOPLE` gql document (adds `user` field).
- `components/search/useSearchQueries.ts` — the five-query hook.
- `components/search/AgentCard.tsx` — People result card.
- `components/search/LocationFilterSection.tsx` — self-contained location picker (copied from `CatalogFilterSidebar`, not extracted — see Task 7).
- `components/search/SearchFilterPanel.tsx` — shared filter set; inline column + drawer.
- `components/search/SearchHeader.tsx` — dark header band.
- `components/search/SearchCategoryTabs.tsx` — category strip with counts.
- `components/search/SearchToolbar.tsx` — filters toggle + pill search + sort + list/map toggle.
- `components/search/SearchResultsGrid.tsx` — one category's grid + states.
- `components/search/SearchAllView.tsx` — grouped preview of every non-empty category.
- `components/search/SearchResults.tsx` — orchestrator.
- `components/search/NoQueryPrompt.tsx` — centred "Search the platform" prompt.

**Modify:**

- `styles/theme.css` — add `--ifr-type-machine` (+ `-bg`).
- `tailwind.config.js` — register `ifr.machine` colour.
- `components/EntityTypeIcon.tsx` — real gear glyph for `MACHINE` instead of the Design fallback.
- `components/ProjectCardNew.tsx` — optional `forcedType` prop + `MACHINE` branch (colour maps + footer).
- `pages/search.tsx` — rewrite as thin shell + add `getStaticProps`.
- `public/locales/{en,de,fr,it}/common.json` — new keys.
- `tests/render_nru.spec.ts` — replace the stale `/search` assertion.

---

## Task 1: Machine accent colour token

**Files:**

- Modify: `styles/theme.css` (after line 56, the `--ifr-type-dpp-*` block)
- Modify: `tailwind.config.js` (colors block, after the `dpp` entry ~line 89-94)

**Interfaces:**

- Produces: CSS var `--ifr-type-machine` (`#475569`), `--ifr-type-machine-bg` (`rgba(71,85,105,0.1)`); Tailwind colour `ifr.machine` → `var(--ifr-type-machine)`, `ifr.machine.bg` → `var(--ifr-type-machine-bg)`.

- [ ] **Step 1: Add the tokens to `styles/theme.css`**

In the `/* --- Entity type colors --- */` block, directly after the three `--ifr-type-dpp-*` lines, add:

```css
--ifr-type-machine: #475569;
--ifr-type-machine-border: #334155;
--ifr-type-machine-hover: #3b485c;
--ifr-type-machine-bg: rgba(71, 82, 105, 0.1);
```

- [ ] **Step 2: Register the Tailwind colour**

In `tailwind.config.js`, in `theme.extend.colors.ifr`, directly after the `dpp: { … }` object, add:

```js
          machine: {
            DEFAULT: "var(--ifr-type-machine)",
            hover: "var(--ifr-type-machine-hover)",
            border: "var(--ifr-type-machine-border)",
            bg: "var(--ifr-type-machine-bg)",
          },
```

- [ ] **Step 3: Verify**

Run: `pnpm check-types`
Expected: PASS (no type impact).

Run: `grep -n "ifr-type-machine" styles/theme.css tailwind.config.js`
Expected: the four var definitions and the four Tailwind lines.

- [ ] **Step 4: Commit**

```bash
git add styles/theme.css tailwind.config.js
git commit -m "feat(search): add --ifr-type-machine accent colour token"
```

---

## Task 2: Machine glyph in `EntityTypeIcon`

**Files:**

- Modify: `components/EntityTypeIcon.tsx`
- Test (manual): render check in Task 3

**Interfaces:**

- Consumes: nothing new.
- Produces: `<EntityTypeIcon type={ProjectType.MACHINE} … />` renders a gear icon (Carbon `Settings`) instead of recursing to the Design compass.

Context: today `EntityTypeIcon.tsx` has an early return for `MACHINE` that recurses with `ProjectType.DESIGN` (lines ~118-120). The filter sidebar already uses Carbon `Settings` (`@carbon/icons-react`) as the machine icon, so match that.

- [ ] **Step 1: Import the Carbon icon**

At the top of `components/EntityTypeIcon.tsx`, add:

```tsx
import { Settings } from "@carbon/icons-react";
```

- [ ] **Step 2: Replace the Machine fallback**

Replace the block:

```tsx
// Machine falls back to the Design icon (legacy type, no dedicated prototype icon)
if (type === ProjectType.MACHINE) {
  return <EntityTypeIcon type={ProjectType.DESIGN} size={size} className={className} fill={fill} />;
}
```

with:

```tsx
// Machine: Carbon "Settings" gear, matching the machine icon used in CatalogFilterSidebar.
if (type === ProjectType.MACHINE) {
  const px = size === "default" ? 16 : 12;
  return <Settings size={px} className={className} style={{ fill }} />;
}
```

(Note: the `px` const later in the function is declared with `const px = size === "default" ? 16 : 12;` — this early return is before that declaration, so the local `px` here does not collide. Confirm with `pnpm check-types`.)

- [ ] **Step 3: Verify**

Run: `pnpm check-types`
Expected: PASS.

Run: `pnpm check-lint components/EntityTypeIcon.tsx`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/EntityTypeIcon.tsx
git commit -m "feat(search): give EntityTypeIcon a real machine gear glyph"
```

---

## Task 3: `ProjectCardNew` — `forcedType` prop + Machine branch

**Files:**

- Modify: `components/ProjectCardNew.tsx`
- Test (manual): dev app, `/products` and `/designs` unchanged; machine card verified in Task 11.

**Interfaces:**

- Consumes: `--ifr-type-machine` (Task 1), machine glyph (Task 2).
- Produces: `ProjectCardNew` accepts `forcedType?: ProjectType`. When passed, it overrides the `conformsTo.name`-based `getProjectType`. `entityTypeColors`/`entityTypeBg` gain a `MACHINE` entry. A `MACHINE` footer block renders location + machine-type.

Rationale: the search hook always knows which query returned a node, so it passes `forcedType` explicitly rather than relying on `project.conformsTo.name === "Machine"` string matching (which is unverified). This also hardens Designs/Products/Services in the search context.

- [ ] **Step 1: Add the prop**

Change the props interface:

```tsx
interface ProjectCardNewProps {
  project: Partial<EconomicResource>;
  /** When set, overrides conformsTo-based type detection (used by /search, which knows the type per query). */
  forcedType?: ProjectType;
}
```

and the component signature + type resolution:

```tsx
export default function ProjectCardNew({ project, forcedType }: ProjectCardNewProps) {
  // …existing hooks…
  const projectType = forcedType ?? getProjectType(project);
```

- [ ] **Step 2: Add MACHINE to the colour maps**

```tsx
const entityTypeColors: Record<string, string> = {
  [ProjectType.DESIGN]: "var(--ifr-green)",
  [ProjectType.PRODUCT]: "var(--ifr-type-product)",
  [ProjectType.SERVICE]: "var(--ifr-type-service)",
  [ProjectType.DPP]: "var(--ifr-type-dpp)",
  [ProjectType.MACHINE]: "var(--ifr-type-machine)",
};

const entityTypeBg: Record<string, string> = {
  [ProjectType.DESIGN]: "var(--ifr-green)",
  [ProjectType.PRODUCT]: "var(--ifr-type-product)",
  [ProjectType.SERVICE]: "var(--ifr-type-service)",
  [ProjectType.DPP]: "var(--ifr-type-dpp)",
  [ProjectType.MACHINE]: "var(--ifr-type-machine)",
};
```

- [ ] **Step 3: Add the MACHINE footer**

After the closing of the `{/* SERVICE footer */}` block (before `{/* Hover action links */}`), add:

```tsx
{
  /* MACHINE footer */
}
{
  projectType === ProjectType.MACHINE && (
    <div className="border-t border-ifr pt-2 flex items-center justify-between gap-2">
      {project.currentLocation?.name && (
        <div className="flex items-center gap-1.5">
          <LocationMarkerIcon className="w-3.5 h-3.5 text-ifr-text-secondary shrink-0" />
          <span
            className="text-ifr-text-secondary"
            style={{
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-base)",
              fontWeight: "var(--ifr-fw-medium)",
            }}
          >
            {project.currentLocation.name}
          </span>
        </div>
      )}
    </div>
  );
}
```

(`LocationMarkerIcon` is already imported in this file.)

- [ ] **Step 4: Verify no regression**

Run: `pnpm check-types`
Expected: PASS.

Run: `pnpm check-lint components/ProjectCardNew.tsx`
Expected: PASS.

Run: `pnpm dev`, open `http://localhost:3000/products` and `http://localhost:3000/designs`.
Expected: cards look exactly as before (no `forcedType` passed there → `getProjectType` path unchanged).

- [ ] **Step 5: Commit**

```bash
git add components/ProjectCardNew.tsx
git commit -m "feat(search): add forcedType prop and Machine branch to ProjectCardNew"
```

---

## Task 4: Search constants

**Files:**

- Create: `components/search/constants.ts`

**Interfaces:**

- Produces:

  - `type SearchCategory = "designs" | "products" | "services" | "machines" | "people"`
  - `const RESOURCE_CATEGORIES: readonly ["designs","products","services","machines"]`
  - `const ALL_CATEGORIES: readonly SearchCategory[]` (order: designs, products, services, machines, people)
  - `const CATEGORY_LABEL_KEY: Record<SearchCategory, string>` (i18n keys: `"Designs"`, `"Products"`, `"Services"`, `"Machines"`, `"People"`)
  - `const CATEGORY_SINGULAR_KEY: Record<SearchCategory, string>` (`"designs"`, `"products"`, `"services"`, `"machines"`, `"people"` — lowercase, for "No {{category}} match" copy)
  - `const CATEGORY_ACCENT: Record<SearchCategory, string>` (CSS var strings; `people` → `"var(--ifr-text-primary)"`)
  - `const CATEGORY_PROJECT_TYPE: Record<Exclude<SearchCategory,"people">, ProjectType>`

- [ ] **Step 1: Write the file**

```tsx
// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { ProjectType } from "components/types";

export type SearchCategory = "designs" | "products" | "services" | "machines" | "people";

/** Categories backed by economicResources (FETCH_RESOURCES). Order matters for display. */
export const RESOURCE_CATEGORIES = ["designs", "products", "services", "machines"] as const;

/** Every category, in the order they appear in the tab strip and the "All" view. */
export const ALL_CATEGORIES: readonly SearchCategory[] = ["designs", "products", "services", "machines", "people"];

export const CATEGORY_LABEL_KEY: Record<SearchCategory, string> = {
  designs: "Designs",
  products: "Products",
  services: "Services",
  machines: "Machines",
  people: "People",
};

/** Lowercase, for "No {{category}} match “q”" style copy. */
export const CATEGORY_SINGULAR_KEY: Record<SearchCategory, string> = {
  designs: "designs",
  products: "products",
  services: "services",
  machines: "machines",
  people: "people",
};

export const CATEGORY_ACCENT: Record<SearchCategory, string> = {
  designs: "var(--ifr-green)",
  products: "var(--ifr-type-product)",
  services: "var(--ifr-type-service)",
  machines: "var(--ifr-type-machine)",
  people: "var(--ifr-text-primary)",
};

export const CATEGORY_PROJECT_TYPE: Record<(typeof RESOURCE_CATEGORIES)[number], ProjectType> = {
  designs: ProjectType.DESIGN,
  products: ProjectType.PRODUCT,
  services: ProjectType.SERVICE,
  machines: ProjectType.MACHINE,
};
```

- [ ] **Step 2: Verify**

Run: `pnpm check-types`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/search/constants.ts
git commit -m "feat(search): add search category constants"
```

---

## Task 5: `SEARCH_PEOPLE` query document

**Files:**

- Create: `components/search/queries.ts`

**Interfaces:**

- Produces: `SEARCH_PEOPLE` (a `gql` `DocumentNode`) — `query searchPeople($userOrName: String!, $last: Int, $before: ID) { people(last: $last before: $before filter: { userOrName: $userOrName }) { pageInfo { startCursor endCursor hasPreviousPage hasNextPage totalCount pageLimit } edges { cursor node { id name note user images { bin mimeType } primaryLocation { id name } } } } }`

Rationale: the SDK's `FETCH_AGENTS` omits the `user` (handle) field that `AgentCard` shows, and `lib/QueryAndMutation.ts` is re-export-only. Define a local document. `user` is a valid `Person` field (see `GET_USER_LAYOUT` in the SDK).

- [ ] **Step 1: Write the file**

```tsx
// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { gql } from "@apollo/client";

/**
 * Like the SDK's FETCH_AGENTS, but also selects `user` (the handle) and
 * supports `before` for cursor pagination via useLoadMore.
 */
export const SEARCH_PEOPLE = gql`
  query searchPeople($userOrName: String!, $last: Int, $before: ID) {
    people(last: $last, before: $before, filter: { userOrName: $userOrName }) {
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
        totalCount
        pageLimit
      }
      edges {
        cursor
        node {
          id
          name
          note
          user
          images {
            bin
            mimeType
          }
          primaryLocation {
            id
            name
          }
        }
      }
    }
  }
`;
```

- [ ] **Step 2: Verify the import path**

Run: `grep -rn "from \"@apollo/client\"" components/ | head -3`
Expected: at least one existing hit (Apollo `gql` is available). If `@apollo/client` is not directly importable, use `import { gql } from "lib/apollo-compat";` — check `lib/apollo-compat` exports `gql` with: `grep -n "gql" lib/apollo-compat.ts`. Use whichever the repo already uses for `gql` in components.

- [ ] **Step 3: Verify**

Run: `pnpm check-types`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/search/queries.ts
git commit -m "feat(search): add SEARCH_PEOPLE query with handle + pagination"
```

---

## Task 6: `useSearchQueries` hook

**Files:**

- Create: `components/search/useSearchQueries.ts`

**Interfaces:**

- Consumes: `useFilters()` (`designId`, `productId`, `serviceId`, `machineId`, `specsLoading` from `hooks/useFilters`), `FETCH_RESOURCES` (from `lib/QueryAndMutation`), `SEARCH_PEOPLE` (Task 5), `useLoadMore` (`hooks/useLoadMore`), `useQuery` (`lib/apollo-compat`), constants (Task 4), `EconomicResourceFilterParams`, `FetchInventoryQuery`, `EconomicResourceSortField`, `EconomicResourceSortInput`, `SortDirection` (`lib/types`).
- Produces:

  ```ts
  interface CategoryResult {
    items: any[]; // edges: { node }[] for resources, { node }[] for people
    count: number | null; // pageInfo.totalCount; null while loading
    loading: boolean;
    error?: Error;
    hasNext: boolean;
    loadMore: () => void;
    refetch: () => void;
  }
  function useSearchQueries(params: {
    q: string;
    descriptionSearch: boolean; // false when ?desc=0
    tags: string[]; // decoded slugs from ?tags
    near?: { lat: string; long: string; distanceKm: string };
    sort: string; // "Relevance" | "A–Z" | "Z–A"
  }): {
    byCategory: Record<SearchCategory, CategoryResult>;
    totalCount: number | null; // sum of the five counts, null until all resolved
    specsLoading: boolean;
  };
  ```

- [ ] **Step 1: Write the file**

```tsx
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
  const orderBy = SORT_MAP[p.sort];
  const skip = specsLoading || !specId || !p.q;

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

  return {
    items: items ?? [],
    count: data?.economicResources?.pageInfo?.totalCount ?? (skip ? 0 : null),
    loading: !skip && loading && !data,
    error: error as Error | undefined,
    hasNext: !!getHasNextPage,
    loadMore,
    refetch: () => refetch(),
  };
}

function usePeopleCategory(p: Params): CategoryResult {
  const skip = !p.q;
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
    count: data?.people?.pageInfo?.totalCount ?? (skip ? 0 : null),
    loading: !skip && loading && !data,
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
```

- [ ] **Step 2: Verify hook rules & types**

Run: `pnpm check-types`
Expected: PASS. If `FetchInventoryQuery` typing rejects `orderBy` in `variables`, remove `orderBy` from the `variables` object and delete the `SORT_MAP` lookup (leave the `sort` param accepted but unused); add a `// TODO(search): backend has no orderBy on FETCH_RESOURCES; sort dropdown is a visual no-op pending support` comment. This matches current catalogue behaviour.

Run: `pnpm check-lint components/search/useSearchQueries.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/search/useSearchQueries.ts
git commit -m "feat(search): add useSearchQueries hook (5 parallel category queries)"
```

---

## Task 7: `LocationFilterSection` (self-contained copy)

**Files:**

- Create: `components/search/LocationFilterSection.tsx`

**Interfaces:**

- Consumes: `fetchLocation`, `lookupLocation`, `FetchLocation` (`lib/fetchLocation`); `useRouter` (`next/router`); Carbon `LocationStar`, `Close`.
- Produces: `<LocationFilterSection />` — a self-contained block: city/address autocomplete (debounced 300ms, click-outside close) + radius chip row (`10/25/50/100/250`). Reads/writes `nearLat`, `nearLong`, `nearDistanceKm`, `locationLabel` on the URL via shallow `router.push`. No props.

Rationale: the spec preferred extracting this from `CatalogFilterSidebar`, but to keep the catalogue pages at zero regression risk this plan **copies** the logic into a search-owned component. A follow-up dedup issue is filed in Task 16.

- [ ] **Step 1: Copy the location logic**

Create the file. Port lines ~137-234 and the two location `FilterSection` bodies from `components/CatalogFilterSidebar.tsx` into a standalone component. It must contain:

- state: `searchRadius`, `locationLabel`, `locationInput`, `locationOptions`, `locationLoading`, `showLocationDropdown`, `locationDropdownRef`, `debounceRef`
- the three `useEffect`s (URL sync, debounced `fetchLocation`, click-outside)
- `handleLocationSelect`, `handleRadiusChange`, `clearLocation`
- render: the selected-label pill OR the input+dropdown+spinner, then the "Search Radius" label + the five radius chips

Use `--ifr-*` tokens / `ifr-*` utilities exactly as `CatalogFilterSidebar` does (e.g. `bg-ifr-form-input`, `border-ifr-form-input`, `focus:border-ifr-green`, the `bg-[#036a53]` active radius chip). Wrap the whole thing in a `<div className="flex flex-col gap-2">` (no outer `FilterSection` — the parent panel supplies section chrome; see Task 8).

```tsx
// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { Close, LocationStar } from "@carbon/icons-react";
import { FetchLocation, fetchLocation, lookupLocation } from "lib/fetchLocation";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

export default function LocationFilterSection() {
  const { t } = useTranslation("common");
  const router = useRouter();

  // …ported state, effects and handlers exactly as in CatalogFilterSidebar…
  // …ported JSX for the label pill / input+dropdown / radius chips…

  return <div className="flex flex-col gap-2">{/* … */}</div>;
}
```

(The executor copies the concrete bodies verbatim from `CatalogFilterSidebar.tsx`; they are ~100 lines and already token-clean. Do not paraphrase — copy.)

- [ ] **Step 2: Verify**

Run: `pnpm check-types`
Expected: PASS.

Run: `pnpm check-lint components/search/LocationFilterSection.tsx`
Expected: PASS (watch the `i18next` rule — every literal string must be `t(...)`, as in the source).

- [ ] **Step 3: Commit**

```bash
git add components/search/LocationFilterSection.tsx
git commit -m "feat(search): add self-contained LocationFilterSection"
```

---

## Task 8: `SearchFilterPanel`

**Files:**

- Create: `components/search/SearchFilterPanel.tsx`

**Interfaces:**

- Consumes: `LocationFilterSection` (Task 7); `ToggleSwitch` (`components/ToggleSwitch`); `FilterSection` (`components/FilterSection`); `TAG_PREFIX`, `slugifyTagValue`, `PRODUCT_CATEGORY_OPTIONS` (`lib/tagging`); `useIsDesktop` (`hooks/useMediaQuery`); Carbon `Close`, `Tag`, `LocationStar`, `Search` (or heroicons — match `CatalogFilterSidebar`).
- Produces:

  ```ts
  function SearchFilterPanel(props: { collapsed: boolean; onToggle: () => void; asDrawer: boolean }): JSX.Element;
  ```

  Reads `desc`, `tags` from the URL; writes them via shallow `router.push`. Same visual frame as `CatalogFilterSidebar` (sticky inline column at `--ifr-sidebar-width`; left drawer + scrim + `Esc` + body-scroll-lock below `lg`) and the same `Filter by` / `Reset` header.

- [ ] **Step 1: Write the component**

Model the frame on `components/CatalogFilterSidebar.tsx` (the `header`, the `asDrawer` return, the inline `return`, the drawer effects). Replace its `sections` with exactly three:

```tsx
// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { Close, Tag } from "@carbon/icons-react";
import { AdjustmentsIcon } from "@heroicons/react/outline";
import FilterSection from "components/FilterSection";
import ToggleSwitch from "components/ToggleSwitch";
import { PRODUCT_CATEGORY_OPTIONS, TAG_PREFIX, slugifyTagValue } from "lib/tagging";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import LocationFilterSection from "./LocationFilterSection";

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  asDrawer: boolean;
}

export default function SearchFilterPanel({ collapsed, onToggle, asDrawer }: Props) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const drawerOpen = asDrawer && !collapsed;

  // body-scroll lock + Esc-to-close while the drawer is open — copy verbatim
  // from CatalogFilterSidebar's two useEffects.
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onToggle();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen, onToggle]);

  const descOn = router.query.desc !== "0";
  const currentTags = useMemo(() => {
    const raw = router.query.tags;
    if (!raw) return [] as string[];
    return typeof raw === "string" ? raw.split(",") : (raw as string[]);
  }, [router.query.tags]);

  const setParam = (key: string, value: string | null) => {
    const query = { ...router.query };
    if (value === null) delete query[key];
    else query[key] = value;
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  const toggleCategoryTag = (cat: string) => {
    const encoded = `${TAG_PREFIX.CATEGORY}-${slugifyTagValue(cat)}`;
    const next = currentTags.includes(encoded) ? currentTags.filter(x => x !== encoded) : [...currentTags, encoded];
    setParam("tags", next.length ? next.join(",") : null);
  };

  const selectedCategories = useMemo(() => {
    const set = new Set(currentTags);
    return PRODUCT_CATEGORY_OPTIONS.filter(c => set.has(`${TAG_PREFIX.CATEGORY}-${slugifyTagValue(c)}`));
  }, [currentTags]);

  const hasActiveFilters = currentTags.length > 0 || !descOn || !!router.query.nearLat;

  const resetAll = () => {
    const query = { ...router.query };
    ["tags", "desc", "nearLat", "nearLong", "nearDistanceKm", "locationLabel"].forEach(k => delete query[k]);
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  const sections = (
    <>
      <FilterSection icon={<AdjustmentsIcon className="w-4 h-4" />} label={t("Search scope")} defaultOpen>
        <ToggleSwitch
          label={t("Also search descriptions")}
          checked={descOn}
          onChange={checked => setParam("desc", checked ? null : "0")}
        />
      </FilterSection>

      <FilterSection icon={<Close size={16} style={{ display: "none" }} />} label={t("Location")} defaultOpen>
        <LocationFilterSection />
      </FilterSection>

      <FilterSection icon={<Tag size={16} />} label={t("Categories & tags")}>
        <div className="flex flex-col gap-2 max-h-[216px] overflow-y-auto pr-3">
          {PRODUCT_CATEGORY_OPTIONS.map(cat => {
            const active = selectedCategories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategoryTag(cat)}
                className={`text-left px-3 py-2 rounded-ifr-sm transition-colors cursor-pointer ${
                  active ? "bg-ifr-active text-ifr-green font-medium" : "hover:bg-ifr-search text-ifr-text-secondary"
                }`}
                style={{
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-base)",
                  fontWeight: "var(--ifr-fw-medium)",
                }}
              >
                {active ? "✓ " : "+ "}
                {t(cat)}
              </button>
            );
          })}
        </div>
      </FilterSection>
    </>
  );

  const header = (
    <div className="border-b border-ifr px-6 py-4 flex items-center justify-between gap-3 shrink-0">
      <p className="text-ifr-text-primary" style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-md)" }}>
        {t("Filter by")}
      </p>
      <div className="flex items-center gap-3">
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetAll}
            className="text-ifr-text-secondary hover:text-ifr-text-primary underline transition-colors cursor-pointer"
            style={{
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-sm)",
              fontWeight: "var(--ifr-fw-medium)",
            }}
          >
            {t("Reset")}
          </button>
        )}
        {asDrawer && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={t("Close filters")}
            className="flex items-center justify-center -mr-2 text-ifr-text-secondary hover:text-ifr-text-primary transition-colors cursor-pointer bg-transparent border-none"
            style={{ width: "var(--ifr-control-height)", height: "var(--ifr-control-height)" }}
          >
            <Close size={20} />
          </button>
        )}
      </div>
    </div>
  );

  if (asDrawer) {
    return (
      <>
        {drawerOpen && (
          <div className="fixed inset-0 z-[60] bg-[var(--ifr-overlay-dark)]" onClick={onToggle} aria-hidden="true" />
        )}
        <aside
          className="fixed top-0 left-0 bottom-0 z-[70] bg-ifr-surface flex flex-col"
          style={{
            width: "min(var(--ifr-sidebar-width), calc(100vw - 40px))",
            transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 250ms ease",
            boxShadow: drawerOpen ? "var(--ifr-shadow-dropdown)" : "none",
            overscrollBehavior: "contain",
          }}
          aria-hidden={!drawerOpen}
        >
          {header}
          <div className="flex-1 overflow-y-auto">{sections}</div>
        </aside>
      </>
    );
  }

  return (
    <div
      className="bg-ifr-surface border-r border-ifr shrink-0 relative sticky self-start"
      style={{
        width: collapsed ? "0px" : "var(--ifr-sidebar-width)",
        overflow: "hidden",
        transition: "width 250ms ease",
        borderRightWidth: collapsed ? "0px" : undefined,
        top: "var(--ifr-topbar-height)",
        maxHeight: "calc(100vh - var(--ifr-topbar-height))",
      }}
    >
      <div
        className="overflow-y-auto"
        style={{
          width: "var(--ifr-sidebar-width)",
          maxHeight: "calc(100vh - var(--ifr-topbar-height))",
          opacity: collapsed ? 0 : 1,
          transition: "opacity 200ms ease",
          pointerEvents: collapsed ? "none" : undefined,
        }}
      >
        {header}
        {sections}
      </div>
    </div>
  );
}
```

Check `components/FilterSection.tsx` props before wiring (`icon`, `label`, `defaultOpen`, `badge`, `children`) — adjust the calls if the signature differs. If `FilterSection` requires a visible `icon`, give Location a real one (`<LocationStar size={16} />` from `@carbon/icons-react`) instead of the hidden `Close`.

- [ ] **Step 2: Verify**

Run: `pnpm check-types` — Expected: PASS.
Run: `pnpm check-lint components/search/SearchFilterPanel.tsx` — Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/search/SearchFilterPanel.tsx
git commit -m "feat(search): add SearchFilterPanel (scope toggle, location, categories)"
```

---

## Task 9: `AgentCard`

**Files:**

- Create: `components/search/AgentCard.tsx`

**Interfaces:**

- Consumes: `BrUserAvatar` (`components/brickroom/BrUserAvatar`); `LocationMarkerIcon` (`@heroicons/react/outline`); `Link` (`next/link`); `PersonWithFileEssential` (`lib/types/extensions`).
- Produces:

  ```ts
  function AgentCard(props: {
    agent: Partial<PersonWithFileEssential> & {
      user?: string | null;
      primaryLocation?: { name?: string | null } | null;
    };
  }): JSX.Element;
  ```

  Centred card linking to `/profile/${agent.id}`.

- [ ] **Step 1: Write the component**

```tsx
// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { LocationMarkerIcon } from "@heroicons/react/outline";
import BrUserAvatar from "components/brickroom/BrUserAvatar";
import { PersonWithFileEssential } from "lib/types/extensions";
import { useTranslation } from "next-i18next";
import Link from "next/link";

interface Props {
  agent: Partial<PersonWithFileEssential> & {
    user?: string | null;
    primaryLocation?: { name?: string | null } | null;
  };
}

export default function AgentCard({ agent }: Props) {
  const { t } = useTranslation("common");
  const location = agent.primaryLocation?.name;

  return (
    <Link href={`/profile/${agent.id}`}>
      <a className="block no-underline">
        <div
          className="group bg-ifr-surface border border-ifr overflow-hidden flex flex-col items-center text-center gap-1 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer h-full"
          style={{ borderRadius: "var(--ifr-radius-sm)" }}
        >
          <div className="rounded-full overflow-hidden border border-ifr-avatar" style={{ width: 64, height: 64 }}>
            <BrUserAvatar user={agent} size="64px" />
          </div>
          <h3
            className="text-ifr-text-primary mt-2"
            style={{
              fontFamily: "var(--ifr-font-heading)",
              fontSize: "var(--ifr-fs-base)",
              fontWeight: "var(--ifr-fw-bold)",
            }}
          >
            {agent.name}
          </h3>
          {agent.user && (
            <span
              className="text-ifr-text-secondary"
              style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
            >
              {`@${agent.user}`}
            </span>
          )}
          {location && (
            <span
              className="flex items-center gap-1.5 text-ifr-text-secondary"
              style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
            >
              <LocationMarkerIcon className="w-3.5 h-3.5 shrink-0" />
              {location}
            </span>
          )}
          <span
            className="mt-2 text-white"
            style={{
              backgroundColor: "var(--ifr-text-primary)",
              borderRadius: "var(--ifr-radius-sm)",
              padding: "3px 8px",
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-sm)",
              fontWeight: "var(--ifr-fw-semibold)",
            }}
          >
            {t("Person")}
          </span>
        </div>
      </a>
    </Link>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm check-types` — Expected: PASS.
Run: `pnpm check-lint components/search/AgentCard.tsx` — Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/search/AgentCard.tsx
git commit -m "feat(search): add AgentCard for People results"
```

---

## Task 10: `SearchResultsGrid`

**Files:**

- Create: `components/search/SearchResultsGrid.tsx`

**Interfaces:**

- Consumes: `CategoryResult` (Task 6), `SearchCategory` + `CATEGORY_PROJECT_TYPE` + `CATEGORY_SINGULAR_KEY` (Task 4), `ProjectCardNew` (with `forcedType`, Task 3), `AgentCard` (Task 9), `ProductCardSkeleton` (`components/ProductCardSkeleton`), `EmptyState` (`components/EmptyState`), `EconomicResource` (`lib/types`).
- Produces:

  ```ts
  function SearchResultsGrid(props: {
    category: SearchCategory;
    result: CategoryResult;
    q: string;
    limit?: number; // when set (All view), render at most `limit` cards and hide Load more
    showCount?: boolean; // default true; the All view sets false (heading carries the count)
  }): JSX.Element;
  ```

- [ ] **Step 1: Write the component**

```tsx
// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import ProductCardSkeleton from "components/ProductCardSkeleton";
import ProjectCardNew from "components/ProjectCardNew";
import EmptyState from "components/EmptyState";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import AgentCard from "./AgentCard";
import { CATEGORY_PROJECT_TYPE, CATEGORY_SINGULAR_KEY, SearchCategory } from "./constants";
import type { CategoryResult } from "./useSearchQueries";

interface Props {
  category: SearchCategory;
  result: CategoryResult;
  q: string;
  limit?: number;
  showCount?: boolean;
}

const GRID_STYLE: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, var(--ifr-card-track))",
  gap: "var(--ifr-grid-gap)",
  justifyContent: "center",
};

export default function SearchResultsGrid({ category, result, q, limit, showCount = true }: Props) {
  const { t } = useTranslation("common");
  const { items, loading, error, hasNext, loadMore, refetch } = result;
  const visible = typeof limit === "number" ? items.slice(0, limit) : items;

  if (loading) {
    return (
      <div style={GRID_STYLE}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-ifr-surface rounded-ifr-lg p-8 text-center border border-ifr">
        <h3
          className="text-lg font-medium text-ifr-text-primary mb-2"
          style={{ fontFamily: "var(--ifr-font-heading)" }}
        >
          {t("Couldn't load {{category}}", { category: t(CATEGORY_SINGULAR_KEY[category]) })}
        </h3>
        <p className="text-sm text-ifr-text-secondary mb-4">{error.message}</p>
        <button
          type="button"
          onClick={refetch}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-ifr-md"
          style={{ backgroundColor: "var(--ifr-green)" }}
        >
          {t("Try Again")}
        </button>
      </div>
    );
  }

  if (!visible.length) {
    return (
      <EmptyState
        heading={t("No {{category}} match “{{q}}”", { category: t(CATEGORY_SINGULAR_KEY[category]), q })}
        description={t("Try removing filters or searching fewer words.")}
      />
    );
  }

  return (
    <>
      {showCount && (
        <p
          className="text-ifr-text-secondary"
          style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)", marginBottom: 24 }}
        >
          {t("Showing") + " "}
          <span className="text-ifr-text-primary" style={{ fontWeight: "var(--ifr-fw-medium)" }}>
            {visible.length}
          </span>
          {" " + t("results")}
        </p>
      )}

      <div style={GRID_STYLE}>
        {category === "people"
          ? visible.map(({ node }: any) => <AgentCard key={node.id} agent={node} />)
          : visible.map(({ node }: { node: EconomicResource }) => (
              <ProjectCardNew key={node.id} project={node} forcedType={CATEGORY_PROJECT_TYPE[category]} />
            ))}
      </div>

      {typeof limit !== "number" && hasNext && (
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={loadMore}
            className="px-6 py-2.5 border border-ifr rounded-ifr-md text-ifr-text-primary hover:bg-ifr-hover transition-colors"
            style={{
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-base)",
              fontWeight: "var(--ifr-fw-medium)",
            }}
          >
            {t("Load more")}
          </button>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm check-types` — Expected: PASS.
Run: `pnpm check-lint components/search/SearchResultsGrid.tsx` — Expected: PASS. Note the `“` `”` literals inside `t()` keys are allowed (they're inside the translation key). If the `i18next` rule complains about the `{{category}}` string, mirror how `ProjectCardNew` writes `t("LICENSE: {{license}}", { license })` (already in the codebase, so the pattern is accepted).

- [ ] **Step 3: Commit**

```bash
git add components/search/SearchResultsGrid.tsx
git commit -m "feat(search): add SearchResultsGrid with skeleton/empty/error states"
```

---

## Task 11: `SearchAllView`

**Files:**

- Create: `components/search/SearchAllView.tsx`

**Interfaces:**

- Consumes: `SearchResultsGrid` (Task 10), constants (Task 4), `CategoryResult` (Task 6).
- Produces:

  ```ts
  function SearchAllView(props: {
    byCategory: Record<SearchCategory, CategoryResult>;
    q: string;
    onOpenCategory: (c: SearchCategory) => void;
  }): JSX.Element;
  ```

  One section per category whose `count` is `> 0` (or still `null` → show its skeleton), in `ALL_CATEGORIES` order. Each section: heading (accent swatch + label + faded count) + a **Show all ›** button (`onOpenCategory(category)`) + `SearchResultsGrid` with `limit={6}` `showCount={false}`.

- [ ] **Step 1: Write the component**

```tsx
// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { useTranslation } from "next-i18next";
import { ALL_CATEGORIES, CATEGORY_ACCENT, CATEGORY_LABEL_KEY, SearchCategory } from "./constants";
import SearchResultsGrid from "./SearchResultsGrid";
import type { CategoryResult } from "./useSearchQueries";

interface Props {
  byCategory: Record<SearchCategory, CategoryResult>;
  q: string;
  onOpenCategory: (c: SearchCategory) => void;
}

export default function SearchAllView({ byCategory, q, onOpenCategory }: Props) {
  const { t } = useTranslation("common");

  const sections = ALL_CATEGORIES.filter(c => {
    const { count, loading } = byCategory[c];
    return loading || (typeof count === "number" && count > 0);
  });

  if (!sections.length) return null; // parent renders the zero-results state

  return (
    <div className="flex flex-col gap-10">
      {sections.map(category => {
        const result = byCategory[category];
        return (
          <section key={category}>
            <div className="flex items-center gap-2 mb-4">
              <span
                aria-hidden="true"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: CATEGORY_ACCENT[category],
                  display: "inline-block",
                }}
              />
              <h2
                className="text-ifr-text-primary"
                style={{
                  fontFamily: "var(--ifr-font-heading)",
                  fontSize: "var(--ifr-fs-lg)",
                  fontWeight: "var(--ifr-fw-bold)",
                }}
              >
                {t(CATEGORY_LABEL_KEY[category])}
              </h2>
              {typeof result.count === "number" && (
                <span
                  className="text-ifr-text-secondary"
                  style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
                >
                  {result.count}
                </span>
              )}
              <button
                type="button"
                onClick={() => onOpenCategory(category)}
                className="ml-auto text-ifr-green hover:underline"
                style={{
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-base)",
                  fontWeight: "var(--ifr-fw-medium)",
                }}
              >
                {t("Show all")} &rsaquo;
              </button>
            </div>
            <SearchResultsGrid category={category} result={result} q={q} limit={6} showCount={false} />
          </section>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm check-types` — Expected: PASS.
Run: `pnpm check-lint components/search/SearchAllView.tsx` — Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/search/SearchAllView.tsx
git commit -m "feat(search): add grouped SearchAllView"
```

---

## Task 12: `SearchHeader` + `SearchCategoryTabs`

**Files:**

- Create: `components/search/SearchHeader.tsx`
- Create: `components/search/SearchCategoryTabs.tsx`

**Interfaces:**

- `SearchHeader` produces: `function SearchHeader(props: { q: string; totalCount: number | null }): JSX.Element` — dark band, yellow eyebrow `t("Search results")`, `h1` `t("Results for “{{q}}”", { q })`, sub-line `t("{{n}} matches across Designs, Products, Services, Machines and People", { n })` (hidden when `totalCount === null` and on mobile via `hidden md:block`).
- `SearchCategoryTabs` produces:

  ```ts
  function SearchCategoryTabs(props: {
    active: "all" | SearchCategory;
    counts: Record<SearchCategory, number | null>;
    onSelect: (c: "all" | SearchCategory) => void;
  }): JSX.Element;
  ```

  Entries: `All` then `ALL_CATEGORIES`. `All` count = sum when all resolved else nothing. Accent swatch per entry (`CATEGORY_ACCENT`; `all` uses `--ifr-yellow`). `role="tablist"`, each tab `role="tab"` `aria-selected`, count pill has `aria-label={t("{{n}} results", { n })}`. Horizontal scroll below `lg` (`overflow-x-auto`).

- [ ] **Step 1: Write `SearchHeader.tsx`**

```tsx
// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { useTranslation } from "next-i18next";

interface Props {
  q: string;
  totalCount: number | null;
}

export default function SearchHeader({ q, totalCount }: Props) {
  const { t } = useTranslation("common");
  return (
    <div className="bg-ifr-dark border-b border-ifr">
      <div className="p-6 md:p-10 flex flex-col gap-[5px]">
        <p
          className="m-0 uppercase text-ifr-yellow text-[16px] leading-[26px] md:text-[18px] md:leading-[30px]"
          style={{ fontFamily: "var(--ifr-font-heading)", fontWeight: 500 }}
        >
          {t("Search results")}
        </p>
        <h1
          className="m-0 text-ifr-text-inverse text-[28px] leading-[36px] md:text-[36px] md:leading-[44px]"
          style={{ fontFamily: "var(--ifr-font-heading)", fontWeight: 700 }}
        >
          {t("Results for “{{q}}”", { q })}
        </h1>
        {totalCount !== null && (
          <p
            className="m-0 hidden md:block text-ifr-text-inverse-secondary text-[16px] leading-[24px] md:text-[18px] md:leading-[27px]"
            style={{ fontFamily: "var(--ifr-font-body)" }}
          >
            {t("{{n}} matches across Designs, Products, Services, Machines and People", { n: totalCount })}
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `SearchCategoryTabs.tsx`**

```tsx
// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { useTranslation } from "next-i18next";
import { ALL_CATEGORIES, CATEGORY_ACCENT, CATEGORY_LABEL_KEY, SearchCategory } from "./constants";

type TabId = "all" | SearchCategory;

interface Props {
  active: TabId;
  counts: Record<SearchCategory, number | null>;
  onSelect: (c: TabId) => void;
}

export default function SearchCategoryTabs({ active, counts, onSelect }: Props) {
  const { t } = useTranslation("common");
  const resolved = ALL_CATEGORIES.every(c => typeof counts[c] === "number");
  const allCount = resolved ? ALL_CATEGORIES.reduce((a, c) => a + (counts[c] as number), 0) : null;

  const tabs: Array<{ id: TabId; label: string; accent: string; count: number | null }> = [
    { id: "all", label: t("All"), accent: "var(--ifr-yellow)", count: allCount },
    ...ALL_CATEGORIES.map(c => ({
      id: c as TabId,
      label: t(CATEGORY_LABEL_KEY[c]),
      accent: CATEGORY_ACCENT[c],
      count: counts[c],
    })),
  ];

  return (
    <div
      role="tablist"
      aria-label={t("Result categories")}
      className="flex gap-1 px-4 md:px-6 overflow-x-auto border-b"
      style={{ background: "#03302c", borderColor: "rgba(255,255,255,0.12)" }}
    >
      {tabs.map(tab => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={selected}
            type="button"
            onClick={() => onSelect(tab.id)}
            className="flex items-center gap-2 whitespace-nowrap py-3 px-3.5 text-[13px] border-b-2 transition-colors"
            style={{
              color: selected ? "#fff" : "rgba(255,255,255,0.72)",
              borderColor: selected ? "var(--ifr-yellow)" : "transparent",
              fontFamily: "var(--ifr-font-body)",
            }}
          >
            <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 2, background: tab.accent }} />
            {tab.label}
            {typeof tab.count === "number" && (
              <span
                aria-label={t("{{n}} results", { n: tab.count })}
                style={{ fontSize: 11, padding: "1px 6px", borderRadius: 999, background: "rgba(255,255,255,0.14)" }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `pnpm check-types` — Expected: PASS.
Run: `pnpm check-lint components/search/SearchHeader.tsx components/search/SearchCategoryTabs.tsx` — Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/search/SearchHeader.tsx components/search/SearchCategoryTabs.tsx
git commit -m "feat(search): add SearchHeader and SearchCategoryTabs"
```

---

## Task 13: `SearchToolbar`

**Files:**

- Create: `components/search/SearchToolbar.tsx`

**Interfaces:**

- Consumes: `ToolbarDropdown` (`components/ToolbarDropdown`), heroicons `AdjustmentsIcon`, `SearchIcon`.
- Produces:

  ```ts
  function SearchToolbar(props: {
    q: string; // current committed query, prefills the input
    sidebarCollapsed: boolean;
    onToggleSidebar: () => void;
    sort: string;
    onSortChange: (v: string) => void;
    view: "list" | "map";
    onViewChange: (v: "list" | "map") => void;
    showViewToggle: boolean; // false when active tab is People
    onSubmitQuery: (next: string) => void;
  }): JSX.Element;
  ```

  Markup mirrors `CatalogLayout`'s "Search & Sort Bar" (lines ~186-242): Filters toggle, pill `<input type="search">` (local state, prefilled with `q`, `onSubmit` → `onSubmitQuery(trimmed)`), `ToolbarDropdown` for sort (`options={["Relevance","A–Z","Z–A"]}`, `getOptionLabel={t}`), and a List/Map segmented control (`role="radiogroup"`), hidden when `!showViewToggle`.

- [ ] **Step 1: Write the component** — copy the toolbar JSX from `CatalogLayout.tsx` and adapt: add `useState` for the input seeded from `q` (with a `useEffect` to re-seed when `q` changes), wrap in a `<form onSubmit>`, add the segmented toggle:

```tsx
// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { AdjustmentsIcon, SearchIcon } from "@heroicons/react/outline";
import ToolbarDropdown from "components/ToolbarDropdown";
import { useTranslation } from "next-i18next";
import React, { useEffect, useState } from "react";

interface Props {
  q: string;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  sort: string;
  onSortChange: (v: string) => void;
  view: "list" | "map";
  onViewChange: (v: "list" | "map") => void;
  showViewToggle: boolean;
  onSubmitQuery: (next: string) => void;
}

const SORT_OPTIONS = ["Relevance", "A–Z", "Z–A"];

export default function SearchToolbar(props: Props) {
  const { t } = useTranslation("common");
  const [value, setValue] = useState(props.q);
  useEffect(() => setValue(props.q), [props.q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    props.onSubmitQuery(value.trim());
  };

  return (
    <div className="bg-ifr-surface border-b border-ifr px-4 md:px-6 py-4 md:py-5">
      <div className="flex flex-wrap items-center justify-between gap-3 md:gap-6">
        <button
          type="button"
          onClick={props.onToggleSidebar}
          className={`order-1 flex items-center gap-[8px] px-3 shrink-0 border transition-colors cursor-pointer ${
            !props.sidebarCollapsed
              ? "bg-ifr-hover border-ifr text-ifr-text-primary"
              : "bg-ifr-surface border-transparent text-ifr-text-secondary hover:border-ifr hover:text-ifr-text-primary"
          }`}
          style={{ height: "var(--ifr-control-height)", borderRadius: "var(--ifr-radius-sm)" }}
          aria-label={props.sidebarCollapsed ? t("Show filters") : t("Hide filters")}
        >
          <AdjustmentsIcon className="w-4 h-4" />
          <span
            style={{
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-base)",
              fontWeight: "var(--ifr-fw-medium)",
              lineHeight: "21px",
            }}
          >
            {t("Filters")}
          </span>
        </button>

        <form onSubmit={submit} className="order-3 md:order-2 w-full md:w-auto md:flex-1 max-w-[845px] relative">
          <label className="sr-only" htmlFor="search-refine">
            {t("Search")}
          </label>
          <div className="bg-ifr-search border border-ifr rounded-full px-4 py-2.5 md:py-3 flex items-center gap-3">
            <SearchIcon className="w-5 h-5 shrink-0 text-ifr-text-secondary" />
            <input
              id="search-refine"
              type="search"
              value={value}
              onChange={e => setValue(e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-ifr-text-primary placeholder:text-ifr-text-muted outline-none"
              style={{ fontFamily: "var(--ifr-font-body)", lineHeight: "21px" }}
            />
          </div>
        </form>

        <div className="order-2 md:order-3 flex items-center gap-3 shrink-0">
          {props.showViewToggle && (
            <div
              role="radiogroup"
              aria-label={t("Results view")}
              className="flex border border-ifr rounded-ifr-sm overflow-hidden"
            >
              {(["list", "map"] as const).map(v => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={props.view === v}
                  onClick={() => props.onViewChange(v)}
                  className="px-3 py-2 text-[13px]"
                  style={{
                    fontFamily: "var(--ifr-font-body)",
                    background: props.view === v ? "var(--ifr-text-primary)" : "transparent",
                    color: props.view === v ? "#fff" : "var(--ifr-text-secondary)",
                  }}
                >
                  {v === "list" ? t("List") : t("Map")}
                </button>
              ))}
            </div>
          )}
          <ToolbarDropdown
            label={t("Sort by")}
            value={props.sort}
            options={SORT_OPTIONS}
            onChange={props.onSortChange}
            getOptionLabel={o => t(o)}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm check-types` — Expected: PASS.
Run: `pnpm check-lint components/search/SearchToolbar.tsx` — Expected: PASS. (`sr-only` is a standard Tailwind utility; confirm it resolves — if not, use `className="absolute w-px h-px overflow-hidden"` on the label.)

- [ ] **Step 3: Commit**

```bash
git add components/search/SearchToolbar.tsx
git commit -m "feat(search): add SearchToolbar with pill search and list/map toggle"
```

---

## Task 14: `NoQueryPrompt`

**Files:**

- Create: `components/search/NoQueryPrompt.tsx`

**Interfaces:**

- Consumes: `useRouter`, heroicons `SearchIcon`, `Link`.
- Produces: `function NoQueryPrompt(): JSX.Element` — centred `t("Search the platform")` heading, a pill `<form>` that navigates to `/search?q=<value>` on submit, and links to `/designs`, `/products`, `/services`.

- [ ] **Step 1: Write the component**

```tsx
// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { SearchIcon } from "@heroicons/react/outline";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

export default function NoQueryPrompt() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [value, setValue] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (q) router.push({ pathname: "/search", query: { q } });
  };

  return (
    <div className="flex flex-col items-center justify-center text-center gap-6 py-20 px-4">
      <h1
        className="text-ifr-text-primary"
        style={{
          fontFamily: "var(--ifr-font-heading)",
          fontSize: "var(--ifr-fs-2xl)",
          fontWeight: "var(--ifr-fw-bold)",
        }}
      >
        {t("Search the platform")}
      </h1>
      <form onSubmit={submit} className="w-full max-w-[560px]">
        <div className="bg-ifr-search border border-ifr rounded-full px-5 py-3 flex items-center gap-3">
          <SearchIcon className="w-5 h-5 shrink-0 text-ifr-text-secondary" />
          <input
            type="search"
            autoFocus
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={t("Search designs, products, services, machines, people…")}
            className="flex-1 min-w-0 bg-transparent text-ifr-text-primary placeholder:text-ifr-text-muted outline-none"
            style={{ fontFamily: "var(--ifr-font-body)" }}
          />
        </div>
      </form>
      <div
        className="flex gap-4 text-ifr-green"
        style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)" }}
      >
        <Link href="/designs">
          <a className="hover:underline">{t("Designs")}</a>
        </Link>
        <Link href="/products">
          <a className="hover:underline">{t("Products")}</a>
        </Link>
        <Link href="/services">
          <a className="hover:underline">{t("Services")}</a>
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm check-types` — Expected: PASS.
Run: `pnpm check-lint components/search/NoQueryPrompt.tsx` — Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/search/NoQueryPrompt.tsx
git commit -m "feat(search): add NoQueryPrompt state"
```

---

## Task 15: `SearchResults` orchestrator

**Files:**

- Create: `components/search/SearchResults.tsx`

**Interfaces:**

- Consumes: everything above; `useRouter`; `useIsDesktop` (`hooks/useMediaQuery`); `ProjectsMaps` (`components/ProjectsMaps`, dynamic import, `ssr:false`); `EmptyState`; `useFilters` (for spec IDs for the All-map union); `EconomicResourceFilterParams` (`lib/types`).
- Produces: `function SearchResults(): JSX.Element` — the whole page body below the topbar. Reads all URL params, owns the desktop/drawer sidebar-collapsed state, routes between: `NoQueryPrompt` (no `q`), zero-results state (all counts 0), grouped `SearchAllView` (`cat=all`, `view=list`), single `SearchResultsGrid` (`cat=<category>`, `view=list`), map (`view=map`, not People).

- [ ] **Step 1: Write the component**

```tsx
// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import EmptyState from "components/EmptyState";
import { EconomicResourceFilterParams } from "lib/types";
import useFilters from "hooks/useFilters";
import { useIsDesktop } from "hooks/useMediaQuery";
import { useTranslation } from "next-i18next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { ALL_CATEGORIES, SearchCategory } from "./constants";
import NoQueryPrompt from "./NoQueryPrompt";
import SearchAllView from "./SearchAllView";
import SearchCategoryTabs from "./SearchCategoryTabs";
import SearchFilterPanel from "./SearchFilterPanel";
import SearchHeader from "./SearchHeader";
import SearchResultsGrid from "./SearchResultsGrid";
import SearchToolbar from "./SearchToolbar";
import { useSearchQueries } from "./useSearchQueries";

const ProjectsMaps = dynamic(() => import("components/ProjectsMaps"), { ssr: false });

type TabId = "all" | SearchCategory;
const VALID_TABS: TabId[] = ["all", ...ALL_CATEGORIES];

export default function SearchResults() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const { designId, productId, serviceId, machineId } = useFilters();

  const q = typeof router.query.q === "string" ? router.query.q : "";
  const rawCat = typeof router.query.cat === "string" ? (router.query.cat as TabId) : "all";
  const activeTab: TabId = VALID_TABS.includes(rawCat) ? rawCat : "all";
  const view: "list" | "map" = router.query.view === "map" ? "map" : "list";
  const sort = typeof router.query.sort === "string" ? router.query.sort : "Relevance";
  const descriptionSearch = router.query.desc !== "0";
  const tags = useMemo(() => {
    const raw = router.query.tags;
    if (!raw) return [] as string[];
    return (typeof raw === "string" ? raw.split(",") : raw).map(decodeURI);
  }, [router.query.tags]);
  const near = useMemo(() => {
    const { nearLat, nearLong, nearDistanceKm } = router.query;
    if (typeof nearLat === "string" && typeof nearLong === "string" && typeof nearDistanceKm === "string") {
      return { lat: nearLat, long: nearLong, distanceKm: nearDistanceKm };
    }
    return undefined;
  }, [router.query.nearLat, router.query.nearLong, router.query.nearDistanceKm]);

  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [drawerCollapsed, setDrawerCollapsed] = useState(true);
  const sidebarCollapsed = isDesktop ? desktopCollapsed : drawerCollapsed;
  const toggleSidebar = () => (isDesktop ? setDesktopCollapsed(v => !v) : setDrawerCollapsed(v => !v));

  const setQuery = (patch: Record<string, string | null>) => {
    const query = { ...router.query };
    Object.entries(patch).forEach(([k, v]) => (v === null ? delete query[k] : (query[k] = v)));
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  const { byCategory, totalCount } = useSearchQueries({ q, descriptionSearch, tags, near, sort });
  const counts = ALL_CATEGORIES.reduce(
    (acc, c) => ((acc[c] = byCategory[c].count), acc),
    {} as Record<SearchCategory, number | null>
  );

  if (!q) return <NoQueryPrompt />;

  const allResolved = ALL_CATEGORIES.every(c => typeof counts[c] === "number");
  const nothingFound = allResolved && ALL_CATEGORIES.every(c => counts[c] === 0);

  const showViewToggle = activeTab !== "people";
  const effectiveView = showViewToggle ? view : "list";

  // Map filter: active category's spec, or the union of all four on "All".
  const mapSpecIds = [designId, productId, serviceId, machineId].filter(Boolean) as string[];
  const catSpec: Record<SearchCategory, string | undefined> = {
    designs: designId,
    products: productId,
    services: serviceId,
    machines: machineId,
    people: undefined,
  };
  const mapFilter: Partial<EconomicResourceFilterParams> = {
    conformsTo: activeTab === "all" || activeTab === "people" ? mapSpecIds : [catSpec[activeTab]!],
    ...(q && { orName: q }),
    ...(q && descriptionSearch && { orNote: q }),
    ...(tags.length > 0 && { classifiedAs: tags.map(encodeURI) }),
    ...(near && { nearLat: near.lat, nearLong: near.long, nearDistanceKm: near.distanceKm }),
  };

  return (
    <div className="flex flex-col min-w-0">
      <SearchHeader q={q} totalCount={totalCount} />
      {!nothingFound && (
        <SearchCategoryTabs
          active={activeTab}
          counts={counts}
          onSelect={c =>
            setQuery({ cat: c === "all" ? null : c, view: c === "people" ? null : router.query.view ?? null })
          }
        />
      )}

      {nothingFound ? (
        <div className="flex flex-col items-center text-center gap-4 py-20 px-4">
          <h2
            className="text-ifr-text-primary"
            style={{
              fontFamily: "var(--ifr-font-heading)",
              fontSize: "var(--ifr-fs-xl)",
              fontWeight: "var(--ifr-fw-bold)",
            }}
          >
            {t("Nothing found for “{{q}}”", { q })}
          </h2>
          <p className="text-ifr-text-secondary" style={{ fontFamily: "var(--ifr-font-body)" }}>
            {t("Check spelling, use fewer or different words, or browse:")}
          </p>
          <div className="flex gap-4 text-ifr-green" style={{ fontFamily: "var(--ifr-font-body)" }}>
            <Link href="/designs">
              <a className="hover:underline">{t("Designs")}</a>
            </Link>
            <Link href="/products">
              <a className="hover:underline">{t("Products")}</a>
            </Link>
            <Link href="/services">
              <a className="hover:underline">{t("Services")}</a>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <SearchToolbar
            q={q}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={toggleSidebar}
            sort={sort}
            onSortChange={v => setQuery({ sort: v === "Relevance" ? null : v })}
            view={effectiveView}
            onViewChange={v => setQuery({ view: v === "list" ? null : v })}
            showViewToggle={showViewToggle}
            onSubmitQuery={next => setQuery({ q: next || null })}
          />

          <div className="flex flex-1 items-start min-w-0">
            <SearchFilterPanel collapsed={sidebarCollapsed} onToggle={toggleSidebar} asDrawer={!isDesktop} />

            <div className="flex-1 min-w-0 bg-ifr-results p-4 md:p-6">
              {effectiveView === "map" ? (
                <ProjectsMaps filters={mapFilter} bare />
              ) : activeTab === "all" ? (
                <SearchAllView
                  byCategory={byCategory}
                  q={q}
                  onOpenCategory={c => setQuery({ cat: c, view: c === "people" ? null : router.query.view ?? null })}
                />
              ) : (
                <SearchResultsGrid category={activeTab} result={byCategory[activeTab]} q={q} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm check-types` — Expected: PASS. Resolve any `EconomicResourceFilterParams` optional-field mismatches by matching the shapes used in `hooks/useFilters.ts` (`nearLat` etc. are strings there).

Run: `pnpm check-lint components/search/SearchResults.tsx` — Expected: PASS. If the `i18next` rule flags `&rsaquo;`/literal punctuation, move it inside the `t()` value or use an HTML entity in JSX text (already done).

- [ ] **Step 3: Commit**

```bash
git add components/search/SearchResults.tsx
git commit -m "feat(search): add SearchResults orchestrator"
```

---

## Task 16: Rewrite `pages/search.tsx`

**Files:**

- Modify (full rewrite): `pages/search.tsx`

**Interfaces:**

- Consumes: `SearchResults` (Task 15), `SearchLayout` (`components/layout/SearchLayout`), `NextPageWithLayout` (`./_app`), `serverSideTranslations`.
- Produces: default-exported page; `Search.getLayout` wraps in `SearchLayout`; `Search.publicPage = true`; `getStaticProps` loads the `common` namespace.

- [ ] **Step 1: Replace the file contents**

```tsx
// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import Layout from "components/layout/SearchLayout";
import SearchResults from "components/search/SearchResults";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ReactElement } from "react";
import { NextPageWithLayout } from "./_app";

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

const Search: NextPageWithLayout = () => {
  return (
    <div className="min-h-screen bg-ifr-surface">
      <SearchResults />
    </div>
  );
};

Search.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

Search.publicPage = true;

export default Search;
```

- [ ] **Step 2: Delete now-dead code**

Check whether `components/SearchBar.tsx` is referenced anywhere else:

Run: `grep -rn "components/SearchBar\|from \"../components/SearchBar\"\|SearchBar" --include=*.tsx --include=*.ts . | grep -v node_modules | grep -v "ProductsSearchBar"`

If `SearchBar` is only used by the old `pages/search.tsx` (now removed), delete `components/SearchBar.tsx` and add it to the commit. If it's used elsewhere, leave it.

- [ ] **Step 3: Verify**

Run: `pnpm check-types` — Expected: PASS.
Run: `pnpm check-lint pages/search.tsx` — Expected: PASS.
Run: `pnpm dev`, then exercise:

- `http://localhost:3000/search` → the "Search the platform" prompt.
- `http://localhost:3000/search?q=test` → header with `Results for "test"`, category tabs with counts, All view grouped sections.
- Click each tab → correct card type; Machines show slate badge + gear; People show `AgentCard`.
- Toggle List/Map (not on People) → map renders.
- Open Filters → panel; toggle "Also search descriptions", pick a location + radius, toggle a category → grid narrows; Reset clears.
- Resize to < 1024px → tabs scroll horizontally, Filters opens as a drawer, grid is one column.
- `http://localhost:3000/search?q=zzzznotathing` → "Nothing found" state.
- Logged out (clear `localStorage`) → page still renders, no redirect to `/sign_in`.

- [ ] **Step 4: Commit**

```bash
git add pages/search.tsx
# plus components/SearchBar.tsx if deleted
git commit -m "feat(search): rebuild /search on the new faceted search surface"
```

---

## Task 17: i18n keys

**Files:**

- Modify: `public/locales/en/common.json`
- Modify: `public/locales/de/common.json`
- Modify: `public/locales/fr/common.json`
- Modify: `public/locales/it/common.json`

**Interfaces:**

- Produces: translations for every new `t(...)` key introduced in Tasks 4–16.

- [ ] **Step 1: Collect the key list**

Run: `git diff main -- components/search pages/search.tsx | grep -oE 't\("[^"]+"' | sort -u`

Expected keys (superset — reconcile with the grep output):

```
"Also search descriptions"
"All"
"Categories & tags"
"Check spelling, use fewer or different words, or browse:"
"Close filters"
"Couldn't load {{category}}"
"Designs"            (may already exist as key-fallback; add anyway)
"Filter by"
"Filters"
"Hide filters"
"List"
"Load more"
"Machines"
"Map"
"No {{category}} match “{{q}}”"
"Nothing found for “{{q}}”"
"People"
"Person"
"Products"
"Relevance"
"Result categories"
"Results for “{{q}}”"
"Results view"
"Search"
"Search designs, products, services, machines, people…"
"Search results"
"Search scope"
"Search the platform"
"Services"
"Show all"
"Show filters"
"Showing"
"Sort by"
"Try Again"
"Try removing filters or searching fewer words."
"{{n}} matches across Designs, Products, Services, Machines and People"
"{{n}} results"
"A–Z"
"Z–A"
"designs" "products" "services" "machines" "people"  (lowercase, for CATEGORY_SINGULAR_KEY)
"Electronics" "Tools" "Furniture" "Home renovation" "Energy" "Wearables" "Medical" "Sustainability" "Education"  (PRODUCT_CATEGORY_OPTIONS — check which already exist)
```

- [ ] **Step 2: Add to `en/common.json`**

Insert alphabetically (or at the end of the object, before the closing brace — match the file's existing style). For `en`, the value equals the key for plain strings; keep the `{{…}}` placeholders intact. Example additions:

```json
  "Also search descriptions": "Also search descriptions",
  "Categories & tags": "Categories & tags",
  "Couldn't load {{category}}": "Couldn't load {{category}}",
  "No {{category}} match “{{q}}”": "No {{category}} match “{{q}}”",
  "Nothing found for “{{q}}”": "Nothing found for “{{q}}”",
  "Person": "Person",
  "Relevance": "Relevance",
  "Result categories": "Result categories",
  "Results for “{{q}}”": "Results for “{{q}}”",
  "Results view": "Results view",
  "Search results": "Search results",
  "Search scope": "Search scope",
  "Search the platform": "Search the platform",
  "Search designs, products, services, machines, people…": "Search designs, products, services, machines, people…",
  "Show all": "Show all",
  "Try removing filters or searching fewer words.": "Try removing filters or searching fewer words.",
  "{{n}} matches across Designs, Products, Services, Machines and People": "{{n}} matches across Designs, Products, Services, Machines and People",
  "{{n}} results": "{{n}} results",
  "designs": "designs",
  "products": "products",
  "services": "services",
  "machines": "machines",
  "people": "people"
```

Only add keys **not already present** — check each with `node -e "const c=require('./public/locales/en/common.json'); console.log('KEY' in c)"` before adding, to avoid duplicate-key JSON.

- [ ] **Step 3: Add to `de`, `fr`, `it`**

Hand-translate each new key. Use the tone/vocabulary already in those files (search #893's additions for reference). Sample (German):

```json
  "Search results": "Suchergebnisse",
  "Results for “{{q}}”": "Ergebnisse für „{{q}}“",
  "{{n}} matches across Designs, Products, Services, Machines and People": "{{n}} Treffer in Designs, Produkten, Dienstleistungen, Maschinen und Personen",
  "All": "Alle",
  "Machines": "Maschinen",
  "Person": "Person",
  "Show all": "Alle anzeigen",
  "Also search descriptions": "Auch Beschreibungen durchsuchen",
  "Search scope": "Suchbereich",
  "Categories & tags": "Kategorien & Tags",
  "Relevance": "Relevanz",
  "Showing": "Zeige",
  "results": "Ergebnisse",
  "No {{category}} match “{{q}}”": "Keine {{category}} passen zu „{{q}}“",
  "Nothing found for “{{q}}”": "Nichts gefunden für „{{q}}“",
  "Check spelling, use fewer or different words, or browse:": "Rechtschreibung prüfen, weniger oder andere Wörter verwenden, oder stöbern:",
  "Try removing filters or searching fewer words.": "Entferne Filter oder suche mit weniger Wörtern.",
  "Couldn't load {{category}}": "{{category}} konnten nicht geladen werden",
  "Search the platform": "Die Plattform durchsuchen",
  "designs": "Designs", "products": "Produkte", "services": "Dienstleistungen", "machines": "Maschinen", "people": "Personen"
```

Provide `fr` and `it` equivalents (translator judgement; keep placeholders and typographic quotes locale-appropriate — `« … »` for fr, `«…»`/`"…"` for it).

- [ ] **Step 4: Verify**

Run: `pnpm check-format` — Expected: PASS (prettier formats JSON).
Run: `node -e "['en','de','fr','it'].forEach(l=>JSON.parse(require('fs').readFileSync('public/locales/'+l+'/common.json')))"` — Expected: no parse error.
Run: `pnpm check-lint components/search pages/search.tsx` — Expected: PASS (the `i18next/no-literal-string` rule now finds every string has a key).

- [ ] **Step 5: Commit**

```bash
git add public/locales/en/common.json public/locales/de/common.json public/locales/fr/common.json public/locales/it/common.json
git commit -m "feat(search): add i18n keys for the search results rework (en/de/fr/it)"
```

---

## Task 18: Update e2e smoke test + full verification gate

**Files:**

- Modify: `tests/render_nru.spec.ts` (the `Should see /search` block, ~lines 41-44)

**Interfaces:**

- Consumes: the finished page.
- Produces: a meaningful NRU assertion for `/search`.

- [ ] **Step 1: Replace the stale assertion**

The current test asserts `getByText("Search result for")` — a string this rework removes. Replace the block with:

```ts
test("Should see /search", async ({ page }) => {
  await page.goto("/search?q=test");
  // New search surface: dark header with the query as the H1.
  await expect(page.getByRole("heading", { level: 1, name: /Results for/i })).toBeVisible();
  // Category strip renders as a tablist.
  await expect(page.getByRole("tablist")).toBeVisible();
});

test("Should see /search with no query", async ({ page }) => {
  await page.goto("/search");
  await expect(page.getByRole("heading", { name: /Search the platform/i })).toBeVisible();
});
```

- [ ] **Step 2: Run the full gate**

```bash
pnpm check-types
pnpm check-lint
pnpm check-format
pnpm build
```

Expected: all clean. Fix anything that isn't before proceeding.

- [ ] **Step 3: Run the Playwright NRU suite** (needs the env from `tests/fixtures/test.ts` and a reachable backend — run if the environment supports it; otherwise note it as "run in CI")

```bash
pnpm test tests/render_nru.spec.ts
```

Expected: `Should see /search` and `Should see /search with no query` pass, and no other NRU case regressed.

- [ ] **Step 4: Catalogue regression check**

`pnpm dev`, screenshot or eyeball `http://localhost:3000/products`, `/designs`, `/services` and confirm they are visually unchanged from `main` (stash the branch or compare against a `main` checkout).

- [ ] **Step 5: Commit**

```bash
git add tests/render_nru.spec.ts
git commit -m "test(search): update /search NRU smoke assertions for the rework"
```

---

## Task 19: Follow-up issues + PR

**Files:** none (tracker + git).

- [ ] **Step 1: File follow-up issues** (via `bd` — see `CLAUDE.md`)

Create beads for:

1. **DPP search category** — needs a backend DPP list/search query; then add `"dpps"` to `ALL_CATEGORIES`, a `--ifr-type-dpp` tab swatch, and a `SearchResultsGrid` branch (`ProjectCardNew` already renders DPP). Reference this plan.
2. **Per-type facet filters on `/search`** — restore materials / machines-needed / license / complexity / power / environmental panels per category (the spec's deferred "all the filters"), likely by generalising `CatalogFilterSidebar` into a shared component.
3. **Deduplicate the location filter** — `components/search/LocationFilterSection.tsx` is a copy of logic in `CatalogFilterSidebar.tsx`; extract one shared `components/filters/LocationFilterSection.tsx` used by both.
4. **`AgentCard` stats** — show follower / design counts if a cheap source becomes available (`SEARCH_PEOPLE` currently has no counts).
5. **Verify `orName`/`orNote` + `conformsTo` AND semantics** against the live backend (the old `search.tsx` carried a "boolean logic at backend" hack comment); if broken, switch to `name`/`note`.

- [ ] **Step 2: Open the PR**

```bash
git push -u origin <branch>
gh pr create --title "feat(ui): rework the search results page" --body "<summary + testing notes + screenshots + 'Fixes/relates to <bead ids>'>"
```

Body should cover: the five-category model, grouped All view, standalone surface (CatalogLayout untouched), new `--ifr-type-machine` token, i18n for four locales, the deferred DPP category, and the verification performed.

---

## Self-Review

**1. Spec coverage**

| Spec section                                                      | Task(s)                                                                                                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Standalone surface, `CatalogLayout` untouched                     | 15, 16 (+ Global Constraints)                                                                                                               |
| Five parallel queries feed tab counts                             | 6                                                                                                                                           |
| `conformsTo` spec IDs from `useFilters`                           | 6                                                                                                                                           |
| Shared filter (text/`desc`, location, tags)                       | 6 (query), 7 + 8 (UI)                                                                                                                       |
| `orName`/`orNote` + `desc` toggle semantics                       | 6; caveat + fallback in Step 2; Task 19 verify                                                                                              |
| URL as state (all params)                                         | 8, 13, 15                                                                                                                                   |
| Header band                                                       | 12 (`SearchHeader`)                                                                                                                         |
| Category strip w/ counts + accents + a11y                         | 12 (`SearchCategoryTabs`), 1 (machine colour)                                                                                               |
| Toolbar (Filters/search/Sort/List-Map)                            | 13                                                                                                                                          |
| Filter panel (inline + drawer, Reset)                             | 8                                                                                                                                           |
| Single-category grid + skeleton/empty/error/Load more             | 10                                                                                                                                          |
| Grouped All view + "Show all" deep-link                           | 11                                                                                                                                          |
| Zero-results state                                                | 15                                                                                                                                          |
| No-query prompt                                                   | 14                                                                                                                                          |
| Map view (`bare`, hidden for People, union on All)                | 15                                                                                                                                          |
| `AgentCard`                                                       | 9                                                                                                                                           |
| Machine card (`ProjectCardNew` `forcedType` + branch)             | 3 (+ 2 glyph, 1 token)                                                                                                                      |
| `--ifr-type-machine` token                                        | 1                                                                                                                                           |
| i18n four locales                                                 | 17                                                                                                                                          |
| a11y (tablist, radiogroup, drawer focus/Esc, labels)              | 8, 12, 13                                                                                                                                   |
| Testing (types/lint/format/build, NRU, catalogue regression)      | 18                                                                                                                                          |
| Rollout: single PR, follow-up issues                              | 19                                                                                                                                          |
| Open questions (People count, AND semantics, agent fields, glyph) | resolved: People count via `totalCount` (6); glyph (2); agent `user` field via `SEARCH_PEOPLE` (5); AND semantics → Task 6 Step 2 + Task 19 |

No uncovered spec requirement.

**2. Placeholder scan**

- Task 7 says "copy verbatim from `CatalogFilterSidebar.tsx`" rather than reproducing ~100 lines. This is deliberate (DRY — the source is in-repo, token-clean, and must stay byte-identical to what it's copied from) and names exact line ranges and the required symbols. Acceptable.
- Task 17 Step 3 leaves `fr`/`it` values to translator judgement with a worked `de` example and explicit rules (keep placeholders, locale quotes). Acceptable — literal translations can't be pinned in a plan.
- No "TBD"/"handle edge cases"/"add error handling" placeholders. Error, empty, loading, zero, no-query states each have concrete code.

**3. Type consistency**

- `CategoryResult` shape defined in Task 6, consumed with the same field names (`items`, `count`, `loading`, `error`, `hasNext`, `loadMore`, `refetch`) in Tasks 10, 11, 15. ✓
- `SearchCategory` union defined in Task 4, used consistently; `TabId = "all" | SearchCategory` introduced in Tasks 12 and 15 identically. ✓
- `forcedType` prop: added in Task 3, passed in Task 10 as `forcedType={CATEGORY_PROJECT_TYPE[category]}`. ✓
- `useSearchQueries` param object (`q`, `descriptionSearch`, `tags`, `near`, `sort`) defined in Task 6, called with the same keys in Task 15. ✓
- `SEARCH_PEOPLE` `dataQueryIdentifier` is `"people"` in Task 6, matching the query root field in Task 5. ✓
- `ProjectsMaps` prop `filters` + `bare` — matches the signature confirmed in the spec (`components/ProjectsMaps.tsx:64-70`). ✓
- `ToggleSwitch` props (`label`, `checked`, `onChange`) — match `components/ToggleSwitch.tsx`. ✓ (`description` optional, unused.)
- `ToolbarDropdown` props (`label`, `value`, `options`, `onChange`, `getOptionLabel`) — match `components/ToolbarDropdown.tsx`. ✓

One risk flagged inline, not a contradiction: `FETCH_RESOURCES` may not accept `orderBy` (Task 6 Step 2 gives the fallback). Left as-is because it mirrors current `CatalogLayout` behaviour.
