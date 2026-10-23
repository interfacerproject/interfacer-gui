# Marketplace GUI integration — STATUS

**Branch:** `feat/medusa-marketplace-gui` · **Updated:** 2026-10-23
Backend: `interfacer-medusa`, `feat/zenflows-real-events` (PR #1); GUI draft PR #922.
No main/Zenflows/SDK changes in this continuation.
Implementation pins: backend `ef02bdb`, GUI `9c503df`. Maintained bilingual Medusa
review snapshot: backend `docs/review/README.md` and
http://127.0.0.1:3110/it/medusa.html (also `/en/medusa.html`).
PR descriptions #1/#922 are refreshed with current evidence and scope; the earlier
Claude cloud artifact is a historical snapshot, not a republished current guide.

## Implemented and verified

- Native `/market` and `/market/build` journeys: Medusa products, carts, orders,
  manual/test payment, deterministic matching and immutable priced quotes.
- **Logged-in buyers sign with their existing browser wallet.** A one-use challenge
  is verified against the Person's registered Zenflows Ed25519 public key. The
  backend provisions/reuses a native customer and immutable identity link. It never
  receives a private key or trusts a requested buyer/customer/public key.
- Buyer checkout/build/capture signatures bind the actual server-resolved facts.
  Registry/signature failure never downgrades the account to the demo customer.
- Anonymous visitors can still run the original explicitly labeled fixture demo.
  Supplier delivery/production assertions still use disposable fixture keys;
  the dev signer refuses to sign for a real buyer.
- Live stock: `raise` a distinct per-listing resource → `transfer` to the buyer.
- Live build: **Process → produce → transfer**. Production has `outputOf`, and the
  provider receives its own output before handing it over to the buyer.
- The receiver comes from the order's verified identity link, not the fixed demo
  receiver environment variable. **LIVE** links the final Zenflows handover event,
  including for a local receipt whose milestone action is `produce`.
- Browser purchase state is scoped to run/customer/target. Changing account cannot
  restore another customer's saved cart/order/receipt.
- Server-side proxy: fixed upstream, allowlisted paths/methods, loopback socket and
  Host, same-origin, non-production, no-store responses. It forwards signed proofs,
  never a private key, trusted user header or client-chosen target.

## Deliberate local boundaries

The match catalog, service capabilities, prices and merchant assertions remain
seeded demo data. Payments are manual/test, not real money. The seller agent/unit
mapping is still a single configured provider. Without live configuration, or on a
write failure, receipts are local-only and **do not** show LIVE. No successor DPP,
remote PDP/delegation authorization, production deployment or crash-safe outbox is
claimed. General commerce nonce replay/revocation remains inherited; session
challenges alone are single-use and single-process.

The current local Zenflows demo has auth enforcement disabled. Do not expose it or
the GUI fixture proxy publicly. See the backend's `docs/zenflows-bridge.md` for the
protocol, environment, migration, live evidence and recovery limitations.

## Run and click

```bash
# Backend: configure the local Zenflows bridge before starting, as documented.
cd interfacer-medusa && npm run dev:up

# GUI, with compatible Zenflows PR #84 and locally linked SDK PR #7:
cd interfacer-gui-medusa
pnpm exec next dev -p 3002
```

The server-only `MEDUSA_INTERNAL_URL` defaults to `http://localhost:9000`.
For a real buyer, sign in to Interfacer first, then open `/market` or `/market/build`.
The page identifies the buyer and whether the session is verified or disposable.
An anonymous visit intentionally uses the demo account instead.

**Stock:** enabled Buy → order/test payment → Mark delivered → transfer receipt.

**Build:** design with origin DPP → Match → Buy build → Mark produced → produce
milestone receipt, whose LIVE handover follows an actual Process/produce.

Stock is finite. Restarting `dev:up` explicitly publishes a new demo run without
replenishing old units or deleting existing orders/receipts.

## Validation (2026-10-23)

- `npm run test:market`: **20/20** client, proxy, wallet tests.
- `npm run check-types`: clean; targeted ESLint clean.
- Backend `npm run test:unit`: **21/21**; backend typecheck clean.
- Backend historical `npm run test:all`: **9/9 suites**, including signed refusal
  matrices, native commerce workflows and driven storefront browsers. Afterward
  Medusa was restored with the same live bridge environment and a fresh run with
  three available stock units; existing orders/receipts were retained.
- Four **Chromium end-to-end journeys pass**, no stock skip in this run: original
  demo stock/build and new verified-account stock/build.
- Live suite queries the actual Zenflows events to verify receiver, produce event,
  finished Process, quantities and references; session-proof replay, signer misuse
  and cross-account order access are refused. Normal stock retry reuses the receipt.
- Desktop/mobile (1440/390px) inspected; no horizontal overflow. Captures under
  `test-results/market-identity-{desktop,mobile}.png` (ignored generated artifacts).

```bash
npm run test:market
npm run check-types
MARKET_LIVE_E2E=1 MARKET_E2E=1 TEST_BASE_URL=http://localhost:3002 \
  ./node_modules/.bin/playwright test tests/market-identity.spec.ts tests/market.spec.ts \
  --project=chromium --workers=1
```

`tests/market-identity.spec.ts` registers fresh disposable test People and drives
real buyer-wallet signatures; it requires the local Zenflows test configuration.
It creates retained local test data. Stock tests skip when a run is sold out;
production/build remains repeatable. Unit tests require no services.

The earlier Bridge A spec/plan under `docs/superpowers/` records the historical
fixture-only implementation; this status and the backend bridge document describe
the current buyer-wallet/live-event behavior. Task tracking: Beads
`interfacer-gui-25f`, not a new markdown task ledger.
