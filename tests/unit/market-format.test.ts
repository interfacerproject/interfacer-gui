// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  eur,
  fitChecks,
  initials,
  listingsOnSale,
  num,
  badNumbers,
  sellerEarned,
  orderKind,
  orderResourceId,
  orderStage,
  parseRejection,
  processLabel,
} from "../../lib/market/format";
import type { ListingBinding, Order, Receipt, SellerDashboard, SellerOrder } from "../../lib/market/types";

const req = {
  process: ["fdm_3d_print"],
  materials: ["PETG"],
  max_dimensions_mm: { x: 120, y: 80, z: 60 },
  tolerance_mm: 0.3,
  quantity: 2,
};
const cap = {
  processes: ["fdm_3d_print"],
  materials: ["PETG", "PLA"],
  build_volume_mm: { x: 220, y: 220, z: 250 },
  min_tolerance_mm: 0.2,
};

test("money and fabrication terms read like the canvas", () => {
  assert.equal(eur(14.5), "€14.50");
  assert.equal(eur(1249), "€1,249.00");
  assert.equal(processLabel("fdm_3d_print"), "FDM 3D printing");
  assert.equal(processLabel("water_jet"), "water jet");
  assert.equal(initials("Officina Cavour"), "OC");
  assert.equal(initials("srfsh"), "SR");
});

test("fit checks list every requirement and whether the maker meets it", () => {
  assert.deepEqual(
    fitChecks(req, cap).map(c => [c.key, c.label, c.ok]),
    [
      ["process", "FDM", true],
      ["material", "PETG", true],
      ["size", "220 × 220 × 250 mm", true],
      ["tolerance", "± 0.2 mm", true],
    ]
  );
  const small = { ...cap, materials: ["PLA"], build_volume_mm: { x: 100, y: 220, z: 250 }, min_tolerance_mm: 0.5 };
  assert.deepEqual(
    fitChecks(req, small).map(c => c.ok),
    [true, false, false, false]
  );
});

test("Medusa rejection reasons become short labelled reasons; unknown ones stay visible", () => {
  assert.deepEqual(
    parseRejection(
      "missing_material: PETG; too_big: x requires 300mm > 250mm; tolerance: service 0.5mm > required 0.3mm"
    ),
    [
      { kind: "material", detail: "PETG" },
      { kind: "size", detail: "300 mm > 250 mm" },
      { kind: "tolerance", detail: "± 0.5 > ± 0.3 mm" },
    ]
  );
  assert.deepEqual(parseRejection("wrong_process: missing laser_cutting"), [
    { kind: "process", detail: "Laser cutting" },
  ]);
  assert.deepEqual(parseRejection("catalog_owner_changed"), [{ kind: "unavailable", detail: "catalog_owner_changed" }]);
});

const paid = { payment_collections: [{ payments: [{ captured_at: "2026-11-09T10:42:00Z" }] }] };

test("orders: kind and resource come from the line metadata Medusa stamped at checkout", () => {
  const build: Order = {
    id: "order_1",
    items: [
      { id: "i", metadata: { interfacer_build: { design_id: "D1", service_id: "S1", quote_id: "q", quantity: 2 } } },
    ],
  };
  const stock: Order = { id: "order_2", items: [{ id: "i", metadata: { interfacer_resource_id: "R1" } }] };
  assert.equal(orderKind(build), "build");
  assert.equal(orderResourceId(build), "D1");
  assert.equal(orderKind(stock), "stock");
  assert.equal(orderResourceId(stock), "R1");
});

test("numbers as people type them: a decimal comma is a decimal point; a typo is caught, not signed", () => {
  assert.equal(num("1,50"), 1.5);
  assert.equal(num(" 12 "), 12);
  assert.ok(Number.isNaN(num("0.30.2")));
  assert.ok(Number.isNaN(num("")));
  assert.deepEqual(badNumbers({ X: "140", Tolerance: "0.30.2", Pieces: "", Fee: "-1", Unit: "1,5" }), [
    "Tolerance",
    "Pieces",
    "Fee",
  ]);
});

test("earned: what was charged, less what was refunded", () => {
  const o = (captured: boolean, total_eur: number, refunded_eur?: number) =>
    ({ captured, total_eur, refunded_eur } as unknown as SellerOrder);
  assert.equal(sellerEarned([o(true, 64, 64), o(true, 30, 5), o(false, 48)]), 25);
});

test("products on sale: a listing whose one unit was ordered is not on sale, unless that order was cancelled", () => {
  const l = (id: string) => ({ id, catalog_resource_id: "R" + id } as unknown as ListingBinding);
  const o = (listing_id: string, status: string) =>
    ({ id: "o" + listing_id, kind: "stock", listing_id, status } as unknown as SellerOrder);
  const dash = {
    listings: [l("1"), l("2"), l("3")],
    orders: [o("1", "pending"), o("2", "canceled")],
  } as unknown as SellerDashboard;
  assert.deepEqual(
    listingsOnSale(dash).map(x => x.id),
    ["2", "3"]
  );
  assert.deepEqual(listingsOnSale(null), []);
});

test("order stage: a card authorised at checkout is paid; a cancelled order says so", () => {
  // Stripe products: the payment is authorised at checkout and captured at delivery.
  const authorised = { payment_collections: [{ payments: [{ captured_at: null, canceled_at: null }] }] };
  assert.equal(orderStage({ id: "o", ...authorised }, null), "paid");
  const released = {
    payment_collections: [{ payments: [{ captured_at: null, canceled_at: "2026-11-27T00:00:00Z" }] }],
  };
  assert.equal(orderStage({ id: "o", ...released }, null), "placed");
  assert.equal(orderStage({ id: "o", status: "canceled", ...released }, null), "canceled");
  assert.equal(orderStage({ id: "o", payment_collections: [{ payments: [] }] }, null), "placed");
});

test("order stage: placed → paid → made (record syncing) → recorded", () => {
  const receipt = { id: "r", zenflows_sync: { status: "pending" } } as unknown as Receipt;
  assert.equal(orderStage({ id: "o" }, null), "placed");
  assert.equal(orderStage({ id: "o", ...paid }, null), "paid");
  assert.equal(orderStage({ id: "o", ...paid }, receipt), "made");
  assert.equal(
    orderStage({ id: "o", ...paid }, { ...receipt, zenflows_sync: { status: "done" } } as unknown as Receipt),
    "recorded"
  );
  assert.equal(orderStage({ id: "o", ...paid }, { id: "r" } as unknown as Receipt), "recorded", "local-only receipt");
});
