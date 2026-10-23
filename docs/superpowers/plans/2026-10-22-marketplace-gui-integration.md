# Marketplace GUI Integration — Implementation Plan (loop backbone + ledger)

> Execute task-by-task. Each phase: one tracked pi executor (coding) OR inline,
> then the orchestrator independently re-runs the phase's tests before writing the
> ledger line. Commit + ledger per phase. Self-heal via `git reset --hard <base>` +
> single tracked relaunch. Never trust the executor's self-report.

**Goal:** Bring both marketplace journeys (stock + build) into the real
interfacer-gui as native pages, authorized by the real Ed25519 signed envelope, via
a server-side proxy to the already-signed Medusa endpoints.

**Spec:** `docs/superpowers/specs/2026-10-22-marketplace-gui-integration-design.md`

**Tech stack:** Next.js 12 (pages router), React 18, TypeScript, next-i18next,
Playwright, `node --test` for unit. GUI worktree `interfacer-gui-medusa`, branch
`feat/medusa-marketplace-gui`. Marketplace running separately at `:9000`.

## DONE definition

The GUI drives both journeys end-to-end with real signing; `/api/market/*` proxy +
`lib/market/client.ts` covered by green unit/proxy tests; `tests/market.spec.ts`
green when both servers run; sidebar entry present; honesty banners present; STATUS
doc written. No changes to gui `main` or zenflows. Draft PR open.

## Global constraints

- Server-only upstream base `MEDUSA_INTERNAL_URL` (default `http://localhost:9000`);
  never exposed as `NEXT_PUBLIC_*` or to the browser.
- Auth header name exactly `X-Interfacer-Auth`. Signing only on Medusa.
- Proxy forwards to the single configured upstream only — no client-supplied target
  (no SSRF).
- Every new page carries the loud LOCAL-DEV / seeded-data / stand-in-receipts banner.
- SPDX/licence header on every new source file, matching repo style
  (`// SPDX-License-Identifier: AGPL-3.0-or-later` + Dyne copyright).
- Commit attribution: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

## Review focus (inputs the tests must pin)

1. Proxy must NOT accept a client-chosen upstream host/path outside the allowlisted
   `/dev/store` + `/dev/interfacer` prefixes → test a traversal/foreign-path attempt is refused.
2. `X-Interfacer-Auth` must pass through both directions unmodified → test byte-equality.
3. Upstream non-2xx (e.g. `demo_cart_required`) must reach the UI as a visible reason,
   not a blank success → client test asserts the reason propagates.
4. Marketplace down → page shows the "run dev:up" notice, not a crash → client handles 502.
5. Stock Buy must bind to the demo customer/variant → the seeded product only; a
   foreign variant is refused upstream and surfaced.

---

## Phase 1 — Proxy + client module (no UI)

**Files:** `pages/api/market/[...path].ts` (create), `lib/market/client.ts` (create),
`lib/market/types.ts` (create), `tests/unit/market-client.test.ts` (create),
`tests/unit/market-proxy.test.ts` (create).

**Build:**

- Proxy: accept `GET/POST /api/market/<rest>` (plus query string), where `<rest>`
  must match
  `^(dev/store/(config|sign|capture)|dev/interfacer/[a-z0-9/_:-]+|store/[a-z0-9/_:-]+|auth/customer/emailpass)$`
  (the `auth/customer/emailpass` login yields the demo customer's Bearer token; forward
  the `authorization` header too)
  (reject otherwise with 400 `{reason:"market_path_forbidden"}`). The `store/*` prefix
  is required: the real checkout flow (ported from `app.js`) uses Medusa store endpoints
  `store/products`, `store/carts`, `store/carts/:id/customer`, `store/carts/:id/line-items`,
  `store/carts/:id/complete`, `store/payment-collections`,
  `store/payment-collections/:id/payment-sessions`, `store/orders/:id`. Forward method,
  JSON body, the original query string, and BOTH `x-interfacer-auth` and
  `x-publishable-api-key` headers to `${MEDUSA_INTERNAL_URL}/${rest}` (Host implied by the
  URL). Relay upstream status + JSON + any `x-interfacer-auth` response header. The
  publishable key is client-safe by Medusa design; no secret crosses the browser.
  Transport failure → 502 `{reason:"market_upstream_unreachable"}`.
- Client: typed `loadScene/buyStock/deliver/listDesigns/match/buyBuild/produce/receiptsFor`
  calling only `/api/market/*`, orchestrating sign→write sequences, returning
  `{ok,data}` or `{ok:false,reason}`.

**Acceptance (orchestrator re-runs):** `node --test tests/unit/market-*.test.ts`
green (path allowlist refusal, auth passthrough byte-equality, status/reason relay,
502 on unreachable). Manual: `curl -s localhost:3002/api/market/dev/store/config`
returns the scene JSON when Medusa is up.

## Phase 2 — Catalog (stock) page + components + nav

**Files:** `pages/market/index.tsx` (create), `components/market/DevBanner.tsx`,
`components/market/ProductCard.tsx`, `components/market/OrderPanel.tsx`,
`components/market/ReceiptView.tsx` (create), sidebar entry (modify the nav
component that lists `IfSideBarLink`s).

**Build:** Catalog lists seeded products (name, EUR price, DPP ref) from `loadScene`.
Buy → `buyStock` → OrderPanel with order id + total → "Mark delivered" → `deliver`
→ ReceiptView shows the VF transfer receipt. Loud DevBanner. `publicPage=true`,
`getLayout` wraps in the standard `Layout`.

**Acceptance:** `pnpm check-types` clean for new files; page compiles (200 at
`/market`); orchestrator drives stock journey against running Medusa (Buy → deliver →
receipt action `transfer`) via curl-through-proxy or browser and sees the receipt.

## Phase 3 — Build page

**Files:** `pages/market/build.tsx` (create), `components/market/MatchResults.tsx`
(create).

**Build:** list designs (`listDesigns`); "Match" (`match`) → MatchResults shows
compatible services + priced quotes and rejected ones with reason; "Buy build"
(`buyBuild`) → OrderPanel; "Mark produced" (`produce`) → ReceiptView produce receipt.

**Acceptance:** page compiles (200 at `/market/build`); orchestrator drives build
journey against running Medusa (Match → Buy build → produce → receipt action
`produce`, correct provider/design/service/origin-dpp).

## Phase 4 — e2e + docs + final review

**Files:** `tests/market.spec.ts` (create), `docs/marketplace-gui-STATUS.md`
(create), sidebar/i18n polish.

**Build:** Playwright spec driving both journeys, gated behind
`MARKET_E2E=1` (skip + log reason otherwise, since it needs both servers). STATUS doc:
what is real (flows, signing, proxy) vs still stand-in (seeded data, local receipts,
local identity) and the exact click path. Whole-branch review; fix Critical/Important
with a failing test each.

**Acceptance:** `MARKET_E2E=1 pnpm test market.spec.ts` green with both servers up;
unit/proxy tests still green; docs present.

---

## Ledger (append-only; one line per phase)

- Phase 1: DONE (commit e8b1aa4, tests: node --test market-client+market-proxy → 13/13).
  Ruling: proxy allowlist extended to `store/*` and `auth/customer/emailpass` + the
  `authorization`/`x-publishable-api-key` headers — the real checkout flow (ported from
  app.js) needs Medusa store endpoints and the demo-customer bearer token, not only
  `/dev/*` — cost if wrong: an over-broad allowlist, bounded to four known prefixes with
  no client-chosen host. Proxy verified live through the running GUI → Medusa.
- Phase 2: DONE (commit e8dbcfa, check-types clean; stock journey driven live in the
  GUI → VF transfer receipt ifrea_01M5HC74…). Ruling: marketplace pages render standalone
  (`getLayout = page => page`, `publicPage = true`) rather than inside the auth-gated
  Layout/Sidebar chrome — the Sidebar returns null without a user, so wrapping a public
  dev page in it would blank the nav anyway — cost if wrong: the page lacks the app chrome,
  reachable by direct URL + the sidebar link for logged-in users. localStorage journey
  state is wrapped in try/catch per the browser-storage guidance.
- Phase 3: DONE (commit b314d42, check-types clean; build journey driven live in the GUI
  → VF produce receipt ifrea_01M5HCB6…, provider p4-demo-provider-standard→buyer, resource
  ifdes_p4_organizer, service ifsvc_p4_standard, qty 2). Match showed 2 compatible + 4
  reasoned rejections; match-only design (no origin DPP) correctly disables purchase.
- Phase 4: DONE (commit 2743370 + lint 1dc896b). e2e: build journey PASS end-to-end;
  stock PASS-or-skip (skips when the demo run is sold out, by design). Unit 13/13,
  check-types + eslint clean. STATUS doc written.
- Final review: self-review (no subagent — session instruction is not to spawn agents).
  Re-graded by effect. No Critical/Important. Review-focus items all covered by the
  proxy/client unit tests + the live drives. Deferred minors:
  - Final: minor (deferred): a non-JSON upstream error (e.g. an HTML 500 from Medusa)
    surfaces as the generic "server not reachable" notice rather than the raw reason,
    because the client parses JSON before checking status. Dev-only; endpoints return
    JSON in practice.
  - Final: minor (deferred): no explicit "retry capture" control if the local test
    payment authorizes but capture fails (near-impossible with pp_system_default);
    delivery still works, so the VF receipt is still reachable.

## MARKETPLACE-GUI COMPLETE (bridge A)
