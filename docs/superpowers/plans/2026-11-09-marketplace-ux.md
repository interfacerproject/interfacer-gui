# Marketplace UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the LOCAL DEV `/market` island into a presentable marketplace woven into the Interfacer app, as drawn on the Claude Design canvas, with makers declaring which designs they build.

**Architecture:** Medusa gains *build listings* (a fabrication service owner signs "I build design D for setup + per-piece, ready in N days"); live matching only quotes services that listed the design, at the listed price. The GUI renders commerce on the pages people already use (project pages get a Buy or Get-it-built panel), adds a catalogue, checkout, buyer orders, a Selling dashboard and a Start-selling hub, and a Shop tab on profiles. Everything stays behind `NEXT_PUBLIC_FF_MARKETPLACE` and the existing local-only `/api/market` proxy.

**Tech Stack:** Medusa v2 module (TypeScript, node:test), Next.js 12 pages router, Tailwind + `--ifr-*` tokens, next-i18next, Playwright.

**Spec:** Claude Design canvas https://claude.ai/artifact/5cdcPtwAUCZAbFsDGsHPFn (8 artboards) + the user's decisions of 2026-11-09: two buyer paths; the request → maker confirms / counter-offers flow is deferred (Beads `interfacer-gui-pvo`); a service marks the compatible designs it can build. Tracking: Beads `interfacer-gui-5q3`.

## Global Constraints

- Feature branches only: GUI `feat/marketplace-ux` (stacked on #922), Medusa `feat/build-listings` (stacked on PR #1). No push without the user's go.
- Never commit `interfacer-medusa/medusa/medusa-config.ts` (local Admin toggle) or the GUI's machine-local files (`.beads/.auto-import-issues.jsonl`, `.beads/.local_version`, `.beads/last-touched`, `pnpm-lock.yaml`).
- Every owner write is wallet-signed by the accountable Person (`catalog.build.list`), verified against Zenflows like `catalog.*.register`.
- Prices are integer cents server-side; `priceCents` rules (≥ 0, ≤ 1,000,000 EUR, two decimals). Lead time integer days 1–365.
- UI strings go through `t()` (i18n lint is on for these pages: no file-level disable).
- Visual language: `styles/theme.css` tokens; dark `--ifr-bg-dark` header with yellow eyebrow; Space Grotesk headings; IBM Plex Mono for specs/units; square cards with `--ifr-border`.
- No fabricated data in the product: empty states instead of sample content.

## Review Focus

1. A service that stops being compatible (capabilities edited) after listing a design must not be quoted — matching rechecks compatibility at match time (Task 1 test `listed but incompatible is rejected`).
2. A listing signed by someone who no longer owns the service must not appear (live catalog revalidation; Task 1 test `listings of excluded services are dropped`).
3. Anonymous visitors can browse the catalogue and project panels; buying asks them to sign in instead of erroring (Task 3 `browse` path; Task 5 checkout gate).
4. A buyer cannot buy from themselves — surfaced as a readable message, not a raw reason (Task 5 error copy for `self_purchase_forbidden`).
5. Phone width (390 px): catalogue, project panel, checkout and selling never scroll sideways (Task 7 e2e viewport check).

---

### Task 1: Build listings in Medusa

**Files:**
- Create: `medusa/src/modules/interfacer/models/build-listing.ts`, `medusa/src/modules/interfacer/build-listing.ts`, `medusa/src/api/dev/interfacer/catalog/build-listings/route.ts`, migration via `medusa db:generate interfacer`
- Modify: `medusa/src/modules/interfacer/service.ts` (register model), `medusa/src/modules/interfacer/build-matching.ts` (live candidates = listed services at listed prices; `lead_days` on each match)
- Test: `medusa/src/tests/build-listing.test.ts`

**Interfaces:**
- Produces: signed op `catalog.build.list` with params `{ service_id, design_id, base_price_eur, per_unit_price_eur, lead_days, active }`; `POST /dev/interfacer/catalog/build-listings` (body = params) → `{ created, listing }`; `GET /dev/interfacer/catalog/build-listings?service=&design=&provider=&include_inactive=1` → `{ listings: BuildListingView[] }` where `BuildListingView = { id, service_id, service_name, provider_person_id, location, design_id, design_name, base_price_eur, per_unit_price_eur, lead_days, quantity, total_eur, active, revision }`; match entries gain `listing: { lead_days }`.
- Pure helpers: `parseBuildListingParams(params)`, `latestListings(rows)`, `listedCandidates(designId, services, listings)`.

- [ ] Tests: params parsing (exact keys, ULIDs, price rules, lead days bounds, boolean active); latest revision wins and inactive hides; candidates carry listed prices; listed-but-incompatible goes to `rejected`; listings of services/designs missing from the live catalog are dropped.
- [ ] Implement, generate + apply the migration, run `npm run test:unit` (all suites green).
- [ ] Commit `feat(build-listings): makers list the designs they build`.

### Task 2: Client, wallet and formatting (GUI)

**Files:** Modify `lib/market/client.ts`, `lib/market/types.ts`, `lib/market/wallet.ts`; create `lib/market/flag.ts`, `lib/market/format.ts`; test `tests/unit/market-client.test.ts`, `tests/unit/market-format.test.ts`.

**Interfaces:**
- `client.browse(): Promise<Result<Scene>>` (config only, no session); `client.buildListings(q)`, `client.setBuildListing(p)`, `client.myOrders()`, `client.services()`; `purchase(kind, target, state, address?)`.
- `format.ts`: `eur(cents)`, `eurAmount(eur)`, `processLabel(id)`, `dims({x,y,z})`, `fitChecks(req, cap) → {label, ok}[]`, `orderStage(order, receipt)`.
- `SELLER_OPS` gains `catalog.build.list`.

- [ ] Tests for browse without wallet, setBuildListing signing the exact params, address passed to the cart, `fitChecks`, `orderStage`; run `pnpm test:market`; commit.

### Task 3: UI primitives and the catalogue

**Files:** create `components/market/ui/*` (`MarketHero`, `TypeChip`, `FitChips`, `Drawing`, `MakerBadge`, `StatusChip`, `MarketEmpty`), rewrite `pages/market/index.tsx` (Layout, tabs `?view=ready|build`), `pages/market/build.tsx` → redirect; delete `DevBanner`, `MarketNav`, `ProductCard`, `MarketJourney`, `MatchResults` once unused.

- [ ] Ready-made: store products of live listings → cards (price, seller, availability) linking to `/project/[resource]`. Built on demand: catalog designs with their listings aggregated (from-price, maker count) linking to `/project/[design]`. Search filter; empty states. Commit.

### Task 4: Project page panels

**Files:** create `components/market/MarketProjectPanel.tsx`, `BuyPanel.tsx`, `GetItBuiltPanel.tsx`; modify `components/ProjectDetailNew.tsx` (topSlot when flag on).

- [ ] Product listed in Medusa → price, availability, seller, "Buy" → `/market/checkout?kind=stock&variant=…&resource=…`. Design registered → requirements, maker list from `match` with fit chips, price, lead time, rejected makers collapsed; "Order from X" → `/market/checkout?kind=build&quote=…&design=…`. Not in the marketplace → nothing rendered. Commit.

### Task 5: Checkout and buyer orders

**Files:** create `pages/market/checkout.tsx`, `pages/market/orders/index.tsx`, `pages/market/orders/[id].tsx`.

- [ ] Checkout: summary (item, maker, price breakdown), delivery address form (required fields), pilot test-payment note, sign-in gate, readable errors; on success → order page. Orders: list from `myOrders()`; order page: progress (paid → made/delivered → recorded), traceability log from the receipt and its Zenflows sync. Commit.

### Task 6: Selling, Start selling, profile Shop tab, navigation

**Files:** create `pages/market/selling.tsx`, `pages/market/start-selling.tsx`, `components/market/ProfileShop.tsx`; redirects from `/market/sales` and `/market/offer`; modify `components/ProfilePageNew.tsx` (Shop tab), `components/NavigationMenu.tsx` (Marketplace, My orders, Selling).

- [ ] Selling: stats, orders with the next action (mark made/delivered, then sign the Interfacer record), my listings and build listings. Start selling: three tracks — service (capabilities → designs you build with setup/per-piece/lead, signed per design), products (list one unit), designs (register build requirements). Profile Shop tab: the person's build listings and products for sale. Commit.

### Task 7: End-to-end and showcase

**Files:** update `tests/market-sellers.spec.ts` (new flow incl. build listing), `tests/market.spec.ts` (paths); update `docs/marketplace-gui-STATUS.md`.

- [ ] Run the live e2e against local Zenflows + Medusa; phone-width screenshots; commit. Update Beads 5q3 and the PR stack notes.
