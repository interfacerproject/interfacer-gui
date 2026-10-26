// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// End-to-end smoke test for the local-dev marketplace GUI. It drives the real
// journeys against a running GUI + Medusa, so it is gated behind MARKET_E2E=1
// (otherwise skipped with a logged reason). Run it with both servers up:
//
//   (interfacer-medusa) npm run dev:up           # Medusa on :9000
//   (interfacer-gui)    pnpm exec next dev -p 3002
//   MARKET_E2E=1 TEST_BASE_URL=http://localhost:3002 \
//     pnpm exec playwright test tests/market.spec.ts --project=chromium
//
// The stock journey consumes seeded one-unit resources, so it buys whatever
// unit is still available and skips if the demo run is sold out. The build
// journey creates build orders and is always repeatable.

import { expect, test } from "@playwright/test";

const ENABLED = process.env.MARKET_E2E === "1";

test.describe("marketplace GUI journeys", () => {
  test.skip(!ENABLED, "set MARKET_E2E=1 with the GUI (:3002) and Medusa (:9000) running");
  // Fixture journeys (disposable demo buyer/supplier keys) exist only when Medusa
  // runs standalone; live mode refuses them. See tests/market-sellers.spec.ts.
  test.beforeEach(async ({ request }) => {
    const scene = await (await request.get("/api/market/dev/store/config")).json().catch(() => ({}));
    test.skip(Boolean(scene.live), "standalone fixture journeys: run dev:up without INTERFACER_ZENFLOWS_URL");
  });

  test("stock: buy an available unit, mark delivered, see the transfer receipt", async ({ page }) => {
    await page.goto("/market");
    await expect(page.getByTestId("market-catalog")).toBeVisible({ timeout: 20000 });

    const available = page.locator('[data-testid="market-buy-stock"]:not([disabled])').first();
    if ((await available.count()) === 0) {
      test.skip(true, "no available stock unit in this demo run (all sold out) — restart dev:up to reseed");
      return;
    }
    await available.click();

    const milestone = page.getByTestId("market-milestone-stock").first();
    await expect(milestone).toBeVisible({ timeout: 30000 });
    await milestone.click();

    const receipt = page.locator('[data-testid="market-receipt"][data-action="transfer"]').first();
    await expect(receipt).toBeVisible({ timeout: 30000 });
    await expect(receipt).toContainText("VF receipt");
  });

  test("build: match a design, buy the build, mark produced, see the produce receipt", async ({ page }) => {
    await page.goto("/market/build");
    await expect(page.getByTestId("market-designs")).toBeVisible({ timeout: 20000 });

    // Match each design in turn (match is async), then buy the first compatible
    // quote that is purchasable (its design has an origin DPP).
    const designs = page.getByTestId("market-design");
    const count = await designs.count();
    let bought = false;
    for (let i = 0; i < count; i++) {
      const card = designs.nth(i);
      await card.getByTestId("market-match-btn").click();
      const buy = card.locator('[data-testid="market-buy-build"]:not([disabled])').first();
      try {
        await buy.waitFor({ state: "visible", timeout: 15000 });
      } catch {
        continue; // match-only design, or no compatible service — try the next
      }
      await buy.click();
      bought = true;
      break;
    }
    if (!bought) {
      test.skip(true, "no purchasable build quote found (no design with an origin DPP matched)");
      return;
    }

    const produce = page.getByTestId("market-milestone-build").first();
    await expect(produce).toBeVisible({ timeout: 30000 });
    await produce.click();

    const receipt = page.locator('[data-testid="market-receipt"][data-action="produce"]').first();
    await expect(receipt).toBeVisible({ timeout: 30000 });
    await expect(receipt).toContainText("VF receipt");
  });
});
