# Marketplace GUI Integration — Design Spec

**Date:** 2026-10-22
**Status:** Approved (design), implementation pending
**Scope:** Bridge A of "integra tutto" — bring the Interfacer × Medusa marketplace
flows into the real interfacer-gui, with real Ed25519 signing. Bridges B/C/D
(real match data, real Zenflows receipt writes, real identity resolver, backed by
a locally-run Zenflows) are explicitly OUT of this slice and follow later.

## 1. Goal

A user, inside the real interfacer-gui, can walk both marketplace journeys from
native GUI pages that match the rest of Interfacer (layout, i18n, styling):

- **Stock:** browse resource-backed products with their passport reference → Buy →
  see the order → Mark delivered → see the ValueFlows receipt (transfer).
- **Build:** pick a design → Match compatible services (+ priced quote) → Buy build
  → see the order → Mark produced → see the ValueFlows receipt (produce).

Every commerce write is authorized by the **real EdDSA signed envelope** (P6a), not
the fixture-controller stub and not a key in the browser.

## 2. Non-goals (this slice)

- No change to the match's data source: designs/services remain the Medusa seeds
  (bridge B makes them real from Zenflows).
- No live Zenflows economic-event write: receipts remain the labeled local
  `rea-receipts` sink (bridge C).
- No change to the identity resolver: key→Person stays the local stand-in (bridge D).
- No changes to interfacer-gui `main` or to zenflows: feature branch + draft PR only.
- No new product-management/admin UI: the catalog is the seeded demo scene, same as
  the storefront today.

## 3. Architecture

```
Browser (GUI page, :3002)
   │  fetch /api/market/*  (same-origin, no secrets client-side)
   ▼
GUI Next API proxy (server-side, pages/api/market/[...path].ts)
   │  fetch http://localhost:9000/dev/{store,interfacer}/*   (loopback, Host: localhost:9000)
   │  forwards method, JSON body, and the X-Interfacer-Auth header both ways
   ▼
Medusa marketplace (:9000)  ──  signing + REAL Ed25519 verify + commerce writes
```

**Why a server-side proxy.** The Medusa storefront guard (`allowStorefront`)
accepts only requests whose `Host` is `localhost:9000`/`127.0.0.1:9000`, from
loopback, with no cross-origin `Origin`. A browser on `:3002` cannot satisfy that.
The GUI's own Next API route runs on the server, reaches Medusa over loopback with
the correct `Host`, and carries no browser `Origin` — so the guard passes. Signing
stays entirely on Medusa; the disposable dev key never reaches the browser. The GUI
holds no marketplace secret.

**Base URL.** The proxy targets `process.env.MEDUSA_INTERNAL_URL` (server-only,
default `http://localhost:9000`). Not `NEXT_PUBLIC_*`: the browser never learns it.

## 4. Medusa endpoints consumed (all already exist and are signed)

| Step               | Call                                                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Load scene         | `GET /dev/store/config` → `{ context, products[], customer_id, buyer_person_id, ... }`                                     |
| Sign an action     | `POST /dev/store/sign` `{action: checkout\|build\|deliver\|produce\|capture, ...}` → `{ auth, label, op, params, person }` |
| Capture payment    | `POST /dev/store/capture` (+ `X-Interfacer-Auth`)                                                                          |
| List designs       | `GET /dev/interfacer/designs`                                                                                              |
| Match a design     | `POST /dev/interfacer/match` `{designId}` → `{matches:[{service,quote}], rejected:[{service,reason}]}`                     |
| Create build order | `POST /dev/interfacer/build-orders` (+ auth)                                                                               |
| Deliver / produce  | `POST /dev/interfacer/{orders\|build-orders}/:id/{deliver\|produce}` (+ auth)                                              |
| Read receipts      | `GET /dev/interfacer/receipts?...`                                                                                         |

Stock checkout reuses the storefront's cart orchestration exactly as `app.js` does
(the reference client at `interfacer-medusa/medusa/src/storefront/app.js`): create a
store cart for the bound demo customer, add the product's variant line, then
`POST /dev/store/sign {action:checkout,cartId}` and complete. The auth header name is
`X-Interfacer-Auth` (`AUTH_HEADER` in `modules/interfacer/signed-envelope.ts`).

The proxy is a transparent forwarder; it does not re-implement any of this logic. A
single thin client module in the GUI (`lib/market/client.ts`) orchestrates the call
sequences, calling only `/api/market/*`.

## 5. GUI surface

**Pages** (public dev pages, `publicPage: true`, `getLayout` = the GUI `Layout` so
the marketplace sits inside the normal chrome):

- `pages/market/index.tsx` — **Catalog**: cards for each seeded resource-backed
  product (name, EUR price, DPP reference). "Buy" runs the stock purchase, then
  reveals the order panel with a "Mark delivered" action and, after delivery, the
  VF transfer receipt.
- `pages/market/build.tsx` — **Build**: list designs; "Match" shows compatible
  services with priced quotes and the rejected ones with their concrete reason;
  "Buy build" places the build order; "Mark produced" reveals the VF produce receipt.

Both pages carry a loud **"LOCAL DEV — fixture/dev keys, seeded data, not
production"** banner (the same honesty posture as the storefront).

**Navigation.** One sidebar entry "Marketplace" (via `IfSideBarLink`), pointing at
`/market`, visible in the existing nav list.

**Client module** `lib/market/client.ts`: typed functions `loadScene()`,
`buyStock(productId)`, `deliver(orderId)`, `listDesigns()`, `match(designId)`,
`buyBuild(quoteId)`, `produce(orderId)`, `receiptsFor(orderId)`. Each calls
`/api/market/*` and returns typed results; no business logic, no signing.

## 6. Components & state

Reuse GUI primitives (`components/brickroom/*`, `CatalogLayout` where it fits). New
small presentational components under `components/market/`:
`ProductCard`, `OrderPanel`, `ReceiptView`, `MatchResults`, `DevBanner`. State is
local React state per page (no global store); the scene loads on mount.

## 7. Error handling

- Proxy forwards Medusa's status code and JSON body unchanged; on a transport
  failure it returns `502 {reason:"market_upstream_unreachable"}`.
- The client surfaces `reason` strings to the UI (e.g. `local_storefront_only`,
  `demo_*_required`, `passport_binding_mismatch`) in a visible error row, never a
  blank failure.
- If `MEDUSA_INTERNAL_URL` is unreachable, the pages render with a clear "marketplace
  server not running — `npm run dev:up` in interfacer-medusa" notice.

## 8. Testing

- **Unit (node --test / ts):** `lib/market/client.ts` builds the right request per
  action against a mocked `fetch` (method, path, body, auth passthrough).
- **Proxy (node --test):** `pages/api/market` forwards method+body+auth to the
  configured upstream and relays status/body; upstream error → 502 reason.
- **Playwright e2e** `tests/market.spec.ts` (requires both servers up): drives the
  stock journey (Buy → Mark delivered → receipt visible with action `transfer`) and
  the build journey (Match → Buy build → Mark produced → receipt with action
  `produce`). Gated behind an env flag so CI without the marketplace skips it, with
  the reason logged.

## 9. Security / honesty invariants

- No marketplace secret or dev key in any `NEXT_PUBLIC_*` or browser payload.
- Signing happens only on Medusa; the GUI cannot forge an envelope.
- The proxy only forwards to the single configured loopback upstream; it never takes
  a target host/URL from the client (no SSRF surface).
- Every page states plainly it is local dev with seeded data and stand-in receipts.

## 10. Deliverable

Feature branch `feat/medusa-marketplace-gui` off `feat/medusa-commerce-dev`, draft
PR. Both journeys drivable from the GUI with real signing; unit + proxy tests green;
Playwright e2e green when both servers run. The existing `/dev/commerce` spike page
stays as-is.
