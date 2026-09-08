# Search results page rework — design

**Date:** 2026-09-08
**Status:** Approved for planning
**Route:** `/search` (`pages/search.tsx`)

## Problem

The search results page is the only major surface still on the pre-rework
look. Recent PRs (#884, #887, #888, #889, #892, #893) moved the homepage,
catalogue pages, forms and auth screens onto a shared token-driven design
system (`--ifr-*` custom properties, `bg-ifr-*` Tailwind utilities, Space
Grotesk headings, IBM Plex Sans body, dark header bands, pill search, the
`ProjectCardNew` grid). `/search` was left behind:

- The in-body search field is a bare unstyled `<input>` that does
  `router.push('/search?q=' + searchString)` with **no URL encoding** and
  no submit affordance.
- It uses Polaris `Tabs`, `Checkbox`, `Button`, `Stack` widgets and a
  hardcoded `#5DA091` green.
- Results render through `ProjectsCards` → `CardsGroup` →
  `ProjectCardFigma`, the _old_ card, not `ProjectCardNew`.
- Two result buckets only: **Projects** (all economic resources) and
  **People** (agents), the latter as a raw table.
- There is a typo in a visible string ("do not search inside the the
  description").

## Goals

1. Bring `/search` fully onto the current design system, visually
   consistent with `/products`, `/designs`, `/services` and the homepage.
2. Replace the "Projects" umbrella with **five visually differentiated
   result categories**: Designs, Products, Services, Machines, People.
3. Keep faceted refinement (text, location, tags) and the map view.
4. Make the page pleasant and legible: clear result counts, good empty and
   error states, responsive down to phone widths.

## Non-goals / explicit scope decisions

These were decided during brainstorming and are fixed unless this doc is
revised:

- **No DPP category this pass.** No backend list/search query exists for
  DPPs (only single-DPP fetch). Ship five categories; file a follow-up
  issue for DPP search when the query lands. The category strip is built so
  a sixth entry can be added later without restructuring.
- **One shared filter set across all categories** — text query, location
  (city + radius), and categories & tags. **No per-type facet sections**
  (no materials / machines-needed / license / complexity / power /
  environmental panels). `CatalogFilterSidebar`'s rich per-variant sections
  are **not** reused. This can be deepened in a later pass.
  - _Tension to note:_ an earlier answer said "all the filters"; the
    explicit later choice was "one shared filter set, no per-type
    sections". This doc follows the explicit later choice.
- **`CatalogLayout` behaviour is not modified, and `CatalogFilterSidebar`
  is not modified except for one pure, behaviour-preserving extraction**
  (the location-picker section — see the Filter panel section). The search
  surface is standalone. It re-uses leaf components (`ProjectCardNew`,
  `ProjectsMaps`, `ToolbarDropdown`, `ProductCardSkeleton`, `EmptyState`,
  `BrUserAvatar`, `EntityTypeIcon`) and the `useLoadMore` hook, and
  reproduces the hero/toolbar markup with the same tokens. The three live
  catalogue pages must render byte-identical after this change.
- No change to search entry points (topbar still pushes `/search?q=…`;
  `SearchLayout` still renders `<Topbar search={false} />`).
- `Search.publicPage = true` stays; the page keeps working logged-out.

## Architecture

### Page composition

`pages/search.tsx` stays a thin `NextPageWithLayout` using `SearchLayout`.
All logic moves into new components under `components/search/`:

```
pages/search.tsx                         thin page shell; reads `q`, renders <SearchResults>
components/search/SearchResults.tsx      orchestrator: runs the 5 queries, owns category + view state
components/search/SearchHeader.tsx       dark header band: eyebrow, "Results for “q”", sub-line
components/search/SearchCategoryTabs.tsx category strip with per-category counts
components/search/SearchToolbar.tsx      Filters toggle + pill search (prefilled) + Sort + List/Map toggle
components/search/SearchFilterPanel.tsx  shared filter set; inline column on desktop, drawer < lg
components/search/SearchResultsGrid.tsx  one category's grid: count line, cards, skeleton/empty/error, Load more
components/search/SearchAllView.tsx      grouped preview: a SearchResultsGrid section per non-empty category
components/search/AgentCard.tsx          new People card
components/search/MachineCardAdapter    (see "Machine card" below — may just be ProjectCardNew)
components/search/useSearchQueries.ts    hook: fires the 5 queries, returns {counts, data, loading, error} per category
```

Each file has a single purpose and can be read without the others. The
orchestrator holds the small amount of shared state (active category,
list/map view); everything else is presentational + its own query.

### Data flow

Five queries run **on mount**, in parallel, regardless of active category —
they feed the tab counts:

| Category | Query             | Key variables                     |
| -------- | ----------------- | --------------------------------- |
| Designs  | `FETCH_RESOURCES` | `filter.conformsTo = [designId]`  |
| Products | `FETCH_RESOURCES` | `filter.conformsTo = [productId]` |
| Services | `FETCH_RESOURCES` | `filter.conformsTo = [serviceId]` |
| Machines | `FETCH_RESOURCES` | `filter.conformsTo = [machineId]` |
| People   | `FETCH_AGENTS`    | `userOrName = q`, `last: 12`      |

- `designId` / `productId` / `serviceId` / `machineId` come from
  `useFilters()` (already resolves them from `QUERY_PROJECT_TYPES` →
  `instanceVariables.specs`; `machineId` is already exposed as
  `coformsToIds.machine`).
- Each `FETCH_RESOURCES` call also carries the **shared filter**:
  - text: `orName = q`, and `orNote = q` **unless** "also search
    descriptions" is unchecked (URL param `desc=0`).
  - location: `nearLat` / `nearLong` / `nearDistanceKm` from URL (set by
    the filter panel, same param names as `CatalogFilterSidebar`).
  - tags: `classifiedAs = tags.split(",").map(encodeURI)` from URL.
  - `notCustodian: [NEXT_PUBLIC_LOSH_ID]` to match catalogue behaviour.
- Counts come from `data.economicResources.pageInfo.totalCount` /
  `data.people.pageInfo` (People has no `totalCount`; use edge count with a
  "+" when `hasNextPage`, or show no count for People — see Open Questions).
- Pagination per category via the existing `useLoadMore` hook
  (`dataQueryIdentifier` = `"economicResources"` or `"people"`).
- Sorting: reuse the `SORT_MAP` approach from `CatalogLayout` (Relevance
  default → `CreatedAt DESC`; `A–Z` / `Z–A` → `Name`). "Relevance" is a
  label for the default order; the backend has no real relevance score.
  People results are not sorted client-side.

> **Backend boolean-logic caveat:** the current `search.tsx` carries a hack
> comment ("until we fix the boolean logic at backend") around combining
> `orName`/`orNote` with other filters. During implementation, verify that
> `conformsTo` (AND) combined with `orName`/`orNote` (OR) and
> `classifiedAs` returns the expected intersection for each category. If the
> backend still can't AND these cleanly, fall back to `name`/`note`
> (non-OR) with `desc` toggle switching between `name`-only and
> `name`+`note`, and record the limitation.

### URL as state

All refinement lives in the query string so results are shareable and
back/forward works (matches `CatalogLayout`):

| Param                                                 | Meaning                                                                              | Default                   |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------- |
| `q`                                                   | search text                                                                          | — (no-query prompt state) |
| `cat`                                                 | active category: `all` / `designs` / `products` / `services` / `machines` / `people` | `all`                     |
| `view`                                                | `list` / `map`                                                                       | `list`                    |
| `sort`                                                | `Relevance` / `A–Z` / `Z–A`                                                          | `Relevance`               |
| `desc`                                                | `0` disables description search                                                      | enabled                   |
| `tags`                                                | comma-separated tag slugs                                                            | —                         |
| `nearLat`,`nearLong`,`nearDistanceKm`,`locationLabel` | geo filter                                                                           | —                         |

Navigation uses `router.push({ pathname, query }, undefined, { shallow: true })`.

## Screen behaviour

### Header band (`SearchHeader`)

- Background `--ifr-bg-dark` (`#042220`), `border-b border-ifr`, padding
  `p-6 md:p-10` — same as `CatalogLayout`'s hero, but no stat cards.
- Uppercase yellow eyebrow (`text-ifr-yellow`, Space Grotesk 500):
  `t("Search results")`.
- `h1` (`text-ifr-text-inverse`, Space Grotesk 700, `28px` / `36px`
  desktop): `t('Results for “{{q}}”', { q })`.
- Sub-line (`text-ifr-text-inverse-secondary`): `t('{{n}} matches across
Designs, Products, Services, Machines and People', { n: totalAcross })`.
  Hidden on mobile and while counts load.

### Category strip (`SearchCategoryTabs`)

- Sits directly under the header on `#03302c` (a hair lighter than the
  header), `border-b border-white/12`. Horizontally scrollable below `lg`.
- Entries: **All**, then Designs, Products, Services, Machines, People.
- Each entry: an 8×8 rounded accent swatch, the label, and a count pill
  (`bg-white/14`, e.g. `12`, `0`). Active entry: white text, `2px`
  `--ifr-yellow` bottom border.
- Accent colours:
  - Design `--ifr-green` `#036a53` (existing)
  - Product `--ifr-type-product` `#143bb5` (existing)
  - Service `--ifr-type-service` `#8200db` (existing)
  - **Machine `--ifr-type-machine` `#475569` (new token — slate)**
  - People — no hue; swatch uses `--ifr-text-primary` `#0b1324`
- Selecting an entry sets `cat` in the URL.

### Toolbar (`SearchToolbar`)

Reproduces `CatalogLayout`'s search-and-sort bar markup:

- `bg-ifr-surface border-b border-ifr`, `px-4 md:px-6 py-4 md:py-5`,
  `flex flex-wrap items-center justify-between gap-3 md:gap-6`.
- **Filters** toggle button (Adjustments icon + `t("Filters")`), same
  active/inactive styling as `CatalogLayout`.
- **Pill search** — `bg-ifr-search border border-ifr rounded-full`,
  `SearchIcon`, an `<input type="search">` **prefilled with `q`**;
  submitting sets `q` (trimmed, and the value _is_ URL-encoded by
  `router.push`). Drops to its own full-width row below `md`.
- **Sort** — `ToolbarDropdown` (`label={t("Sort by")}`, options
  `["Relevance","A–Z","Z–A"]`, `getOptionLabel={t}`).
- **List / Map** segmented toggle — sets `view`. Hidden when
  `cat === "people"` (agents have no map geometry). On `cat === "all"` the
  map plots every geo-bearing economic resource from the four resource
  queries combined.

### Filter panel (`SearchFilterPanel`)

Standalone component, **not** `CatalogFilterSidebar`. Same frame as
`CatalogFilterSidebar` (inline `--ifr-sidebar-width` column, sticky under
the topbar on desktop; left drawer with scrim + `Esc` close + body-scroll
lock below `lg`), and a `Filter by` / `Reset` header. Sections:

1. **Search scope** — a single `ToggleSwitch`: "Also search descriptions"
   (on by default; off sets `desc=0`). Only affects the four resource
   queries.
2. **Location** — city/address autocomplete (reuse `fetchLocation` /
   `lookupLocation` + the debounced dropdown pattern from
   `CatalogFilterSidebar`) and a radius chip row (`10/25/50/100/250 km`),
   writing `nearLat`/`nearLong`/`nearDistanceKm`/`locationLabel`.
3. **Categories & tags** — the `PRODUCT_CATEGORY_OPTIONS` list as
   toggle rows writing `tags` (prefix `category-`), same as
   `CatalogFilterSidebar`'s "Categories & Tags" section.

`Reset` clears `tags`, geo params and `desc` (keeps `q`, `cat`, `view`,
`sort`).

> To avoid duplicating the ~150 lines of location-picker logic three times
> in the codebase, extract it from `CatalogFilterSidebar` into
> `components/filters/LocationFilterSection.tsx` and have **both** > `SearchFilterPanel` and `CatalogFilterSidebar` import it. This is the one
> sanctioned touch of `CatalogFilterSidebar` — a pure extraction with no
> behavioural change; the catalogue pages must still render identically.
> If the extraction proves risky under time pressure, fall back to copying
> the logic into `SearchFilterPanel` and filing a dedup issue.

### Results — single category (`SearchResultsGrid`)

Given a category's `{ items, loading, error, hasNext, loadMore, refetch }`:

- **Count line**: `t("Showing")` **N** `t("results")` (same style as
  `CatalogLayout`).
- **Loading, no data**: 6 `ProductCardSkeleton` in the responsive grid
  (`grid-template-columns: repeat(auto-fill, var(--ifr-card-track))`,
  `gap: var(--ifr-grid-gap)`).
- **Error**: bordered card, `t("Couldn't load {{category}}")`, message,
  `t("Try Again")` → `refetch()`. Does not blank sibling categories.
- **Empty** (`items.length === 0`, not loading, no error):
  `EmptyState heading={t('No {{category}} match “{{q}}”', …)}`,
  `description={t("Try removing filters or searching fewer words.")}`.
- **Cards**: responsive grid.
  - Designs / Products / Services → `ProjectCardNew` unchanged.
  - Machines → see "Machine card".
  - People → `AgentCard`.
- **Load more**: bordered button, `useLoadMore().loadMore`, shown while
  `hasNext`.

### Results — All view (`SearchAllView`)

- For each **non-empty** category in fixed order (Designs, Products,
  Services, Machines, People): a section with a heading (accent swatch +
  `t(label)` + faded count) and a **"Show all ›"** link that sets
  `cat=<category>`. Under it, the first page of that category's cards
  (capped, e.g. 6) via the same card components.
- Empty categories are omitted from the body but remain in the tab strip
  with their `0`.
- While counts are still loading: skeleton sections.
- `view=map` on All: a single `ProjectsMaps` fed the union of the four
  resource filters (or a combined `conformsTo` of all four spec IDs).

### Zero results anywhere

When all five counts are `0` and nothing is loading: replace tabs +
toolbar body with a centred state — `t('Nothing found for “{{q}}”')`,
`t("Check spelling, use fewer or different words, or browse:")`, and links
to `/designs`, `/products`, `/services`, and `?view=map`.

### No query (`/search` with no `q`)

Centred prompt (approved): `t("Search the platform")`, a large pill input
that navigates to `/search?q=…` on submit, and catalogue links. No header
band query line, no tabs.

### Map view

`ProjectsMaps` with `bare` (no catalogue filter toolbar) and its default
height, fed the active category's `effectiveFilter` (or the union on All).
Reuses the single-popup-on-click behaviour shipped in #889. Hidden for
People.

## New / changed design tokens

Add to `styles/theme.css` and mirror in `tailwind.config.js`:

- `--ifr-type-machine: #475569;` (+ `--ifr-type-machine-bg:
rgba(71,85,105,0.1)` if a tinted variant is needed for card footers).
- Register `ifr-type-machine` wherever `ifr-type-service` etc. are
  registered as Tailwind colors.

## Component detail

### `AgentCard` (`components/search/AgentCard.tsx`)

Props: `{ agent }` where `agent` is a `FETCH_AGENTS` node (`id`, `name`,
`user` / handle, `primaryLocation` or equivalent — confirm fields from
`AgentsTableRow`).

- `border border-ifr rounded-ifr-sm bg-ifr-surface p-4`, centred column,
  `Link` to `/profile/[id]`.
- Round `BrUserAvatar` at `64px` with `border-ifr-avatar`.
- Name in Space Grotesk 700 `14px`; `@handle` in `text-ifr-text-secondary`
  `12px`.
- Location line with `LocationMarkerIcon` when present.
- A neutral "Person" tag: `bg-ifr-text-primary text-white rounded-ifr-sm
px-2 py-0.5 text-[10px] font-semibold`.
- Optional footer stat line (`N followers` — only if the count is cheaply
  available from the query; otherwise omit).

### Machine card

Preferred: **extend `ProjectCardNew`** with a `MACHINE` branch —

- add `ProjectType.MACHINE` to `entityTypeColors` / `entityTypeBg`
  (`var(--ifr-type-machine)`),
- give `EntityTypeIcon` a real machine glyph (gear) instead of the current
  Design fallback, using the Carbon `Settings` icon already used for
  machines in `CatalogFilterSidebar`,
- machine footer: `currentLocation.name` + the machine-type tag if present.

`ProjectCardNew` currently falls through Machine to the DESIGN visuals, so
this is additive. If touching `ProjectCardNew` feels too broad, wrap it in
a thin `components/search/MachineCard.tsx` that renders the same structure
with the slate accent — decided at implementation time, but the shared-card
route is preferred for consistency.

### `useSearchQueries` hook

Encapsulates the five `useQuery` calls (skipping until spec IDs resolve),
applies the shared filter, and returns a stable
`Record<Category, { items, count, loading, error, hasNext, loadMore, refetch }>`.
Keeps `SearchResults` readable.

## i18n

New `common.json` keys for all four shipped locales (`en`, `de`, `fr`,
`it`), hand-translated to match #889/#893 tone:

- "Search results", "Results for “{{q}}”",
  "{{n}} matches across Designs, Products, Services, Machines and People"
- "All", "Machines" (confirm "Designs"/"Products"/"Services"/"People"
  already exist), category count a11y labels
- "Also search descriptions"
- "Showing" / "results" (confirm reuse from catalogue)
- "No {{category}} match “{{q}}”", "Try removing filters or searching fewer
  words."
- "Couldn't load {{category}}", "Try Again" (confirm reuse)
- "Nothing found for “{{q}}”", "Check spelling, use fewer or different
  words, or browse:"
- "Search the platform", "Show all", "Relevance"

Remove the buggy "do not search inside the the description" string usage.

## Accessibility

- Category strip: `role="tablist"` / `role="tab"` with
  `aria-selected`, arrow-key navigation, and `aria-controls` pointing at
  the results region; results region `role="tabpanel"` with
  `aria-busy` during load.
- List/Map toggle: `role="radiogroup"`.
- Filter drawer: focus trap while open, `Esc` to close, returns focus to
  the Filters button (mirror `CatalogFilterSidebar`).
- Count pills get `aria-label` (`"12 results"`), decorative swatches
  `aria-hidden`.
- The pill search `<input>` has an associated visually-hidden `<label>`.

## Testing

- **Type check**: `pnpm check-types` clean.
- **Lint / format**: `pnpm check-lint`, `pnpm check-format` clean
  (including the `i18next` no-literal rule on the new components).
- **NRU render test**: `tests/render_nru.spec.ts` already has
  `Should see /search`; extend it to assert the header, the category strip
  with counts, and a card grid render for a query with known results, and
  that `/search` with no `q` shows the prompt state.
- **Manual matrix** (against live data, at 1920 / 1080 / 780):
  - query with hits in every category; query with hits in one; query with
    none.
  - each tab: grid renders the right card type; Load more paginates.
  - All view: grouped sections, "Show all" deep-links, empty categories
    hidden from body / present in strip.
  - list ⇄ map toggle; map hidden on People.
  - "Also search descriptions" off narrows results; location + radius
    filter; tag toggles; Reset.
  - drawer on mobile; horizontal tab scroll; toolbar wrap.
  - logged-out: page works, no redirect.
  - `/products`, `/designs`, `/services` visually unchanged (screenshot
    diff or side-by-side).
- **Regression**: confirm topbar → `/search?q=…` still lands correctly and
  the query with special characters (`&`, spaces, non-ASCII) is encoded.

## Rollout

Single PR. No feature flag (the page is already isolated). Follow-up issue
filed for: DPP category, per-type facet filters, `AgentCard` follower
stats if not available now, and the `LocationFilterSection` dedup if it was
copied rather than extracted.

## Open questions for implementation

1. **People count**: `FETCH_AGENTS` `pageInfo` — does it expose
   `totalCount`? If not, show edge count with `+` on `hasNextPage`, or no
   count pill for People.
2. **`orName`/`orNote` + `conformsTo` AND semantics** — verify against the
   backend (see caveat above); pick the fallback if broken.
3. **`AgentsTableRow` field names** for `AgentCard` (handle, location).
4. Whether `EntityTypeIcon` gets a real machine glyph now or a follow-up.
