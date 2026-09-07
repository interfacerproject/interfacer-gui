// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

/**
 * Every piece of sample data for the commerce preview lives here, typed, in one
 * place. None of it is real: no prices are charged, no stock is reserved, no
 * order is created, nothing is written to zenflows.
 */

export type VariantId = "assembled" | "kit" | "bom";

export interface MockVariant {
  id: VariantId;
  /** Short label, e.g. "Assembled unit". */
  label: string;
  /** One-line qualifier, e.g. "tested, 2-year warranty". */
  blurb: string;
  price: number;
  /** Stock sentence shown next to the green dot. */
  stockLine: string;
  /** Lead-time sentence shown beside the quantity stepper. */
  leadTime: string;
}

export interface MockProduct {
  slug: string;
  name: string;
  seller: string;
  sellerInitials: string;
  location: string;
  listedOn: string;
  description: string;
  tags: string[];
  machinesAndMaterials: string;
  basedOnDesign: string;
  license: string;
  licensor: string;
  variants: MockVariant[];
}

export interface MockLine {
  productSlug: string;
  name: string;
  seller: string;
  sellerInitials: string;
  /** "freight from Hamburg, DE" / "on-site service, Bologna, IT" */
  fulfilment: string;
  variantLabel: string;
  /** Green note under the variant, e.g. "Passport issued on fulfilment". */
  note: string;
  unitPrice: number;
  quantity: number;
  /** Amber status chip on the order screen. */
  status: string;
  /** `false` for the service line — it needs no shipping choice. */
  shippable: boolean;
}

export interface MockSellerOrderRow {
  id: string;
  item: string;
  variant: string;
  buyer: string;
  status: string;
  statusTone: ChipTone;
  passport: string;
  total: string;
}

export interface MockInventoryRow {
  name: string;
  sku: string;
  lead: string;
  qty: string;
  qtyTone: ChipTone;
}

export interface MockAdminRow {
  name: string;
  variants: string;
  seller: string;
  status: string;
  statusTone: "live" | "draft";
  stock: string;
  resource: string;
}

export type ChipTone = "green" | "amber" | "grey";

/* ── The product behind the buy block ── */

export const MOCK_PRODUCT: MockProduct = {
  slug: "lignum-shredder-s1",
  name: "Lignum Shredder S1",
  seller: "Fab City Hamburg",
  sellerInitials: "FH",
  location: "Hamburg, DE",
  listedOn: "listed 12 Mar 2026",
  description:
    "A bench-top plastic shredder built from the Open Shredder v3 design, assembled and tested in Hamburg. Steel hopper, hardened blades, 1.5 kW gearmotor. Sold as a finished machine, as a kit of cut parts, or as the bill of materials for anyone who prefers to source locally.",
  tags: ["recycling", "open-hardware", "plastic", "fab-city"],
  machinesAndMaterials: "Machines: CNC mill, MIG welder · Materials: S235 steel, hardened tool steel, PLA",
  basedOnDesign: "Open Shredder v3",
  license: "CERN-OHL-S-2.0",
  licensor: "Open Shredder Collective",
  variants: [
    {
      id: "assembled",
      label: "Assembled unit",
      blurb: "tested, 2-year warranty",
      price: 890,
      stockLine: "12 in stock",
      leadTime: "ships in 5 days",
    },
    {
      id: "kit",
      label: "Kit of parts",
      blurb: "cut & drilled, you assemble",
      price: 540,
      stockLine: "6 kits in stock",
      leadTime: "ships in 3 days",
    },
    {
      id: "bom",
      label: "Bill of materials",
      blurb: "sourcing list + CAM files",
      price: 35,
      stockLine: "instant download",
      leadTime: "instant download",
    },
  ],
};

export function variantById(id: VariantId): MockVariant {
  return MOCK_PRODUCT.variants.find(v => v.id === id) ?? MOCK_PRODUCT.variants[0];
}

/* ── The second cart line: a booked service, nothing to ship ── */

export const MOCK_SERVICE_LINE: MockLine = {
  productSlug: "cnc-milling-2h",
  name: "CNC milling — 2h slot",
  seller: "Makerspace Bologna",
  sellerInitials: "MB",
  fulfilment: "on-site service, Bologna, IT",
  variantLabel: "Service · 12 Sep 14:00",
  note: "On-site, nothing to ship",
  unitPrice: 120,
  quantity: 1,
  status: "Booked",
  shippable: false,
};

/** The Lignum Shredder line, seeded from the chosen variant + quantity. */
export function makeShredderLine(variantId: VariantId, quantity: number): MockLine {
  const v = variantById(variantId);
  return {
    productSlug: MOCK_PRODUCT.slug,
    name: MOCK_PRODUCT.name,
    seller: MOCK_PRODUCT.seller,
    sellerInitials: MOCK_PRODUCT.sellerInitials,
    fulfilment: "freight from Hamburg, DE",
    variantLabel: v.label,
    note: "Passport issued on fulfilment",
    unitPrice: v.price,
    quantity,
    status: "Awaiting fulfilment",
    shippable: true,
  };
}

export function seedCartLines(variantId: VariantId, quantity: number): MockLine[] {
  return [makeShredderLine(variantId, quantity), { ...MOCK_SERVICE_LINE }];
}

/* ── Totals ── */

export const SHIPPING_FLAT = 48;
export const VAT_RATE = 0.19;

export interface CartTotals {
  subtotal: number;
  shipping: number;
  vat: number;
  total: number;
}

export function computeTotals(lines: MockLine[]): CartTotals {
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const shipping = SHIPPING_FLAT;
  const vat = (subtotal + shipping) * VAT_RATE;
  return { subtotal, shipping, vat, total: subtotal + shipping + vat };
}

/** Format as `€1,234.56` — thousands separator, two decimals. */
export function formatEur(n: number): string {
  return "€" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/* ── Checkout: prefilled-from-profile address (local state only, never sent) ── */

export const MOCK_ADDRESS = {
  fullName: "Servizio Due",
  email: "servizio2@dyne.org",
  street: "Via Zamboni 33",
  city: "Bologna",
  postalCode: "40126",
};

export const MOCK_DELIVERY_OPTIONS = [
  {
    id: "freight",
    title: "Freight, Fab City Hamburg → Bologna",
    detail: "5–7 working days · pallet delivery",
    price: "€48.00",
    selectable: true,
  },
  {
    id: "pickup",
    title: "Pick up at Fab City Hamburg",
    detail: "ready in 3 days · Zeughausmarkt 26",
    price: "€0.00",
    selectable: true,
  },
  {
    id: "service",
    title: "CNC milling — 2h slot",
    detail: "on-site service at Makerspace Bologna, 12 Sep 14:00",
    price: "no shipping",
    selectable: false,
  },
];

export const MOCK_CARD = {
  number: "4242 4242 4242 4242",
  expiry: "09 / 29",
  cvc: "123",
};

/* ── Order confirmation + DPP ── */

export const MOCK_ORDER_ID = "IF-2026-0417";

export const MOCK_DPP = {
  passport: "DPP-2026-0421",
  serial: "LS1-HH-000318",
  product: "Lignum Shredder S1 · Assembled unit",
  basedOn: "Open Shredder v3 · CERN-OHL-S-2.0",
  note: "The order event wrote the buyer into the passport's custody chain. Repairs, spare parts and resale keep updating the same record — commerce becomes one more event in the resource's history, not a separate silo.",
};

/* ── Seller onboarding: readiness checklist ── */

export type OnboardingState = "done" | "todo" | "optional";

export interface OnboardingTask {
  id: string;
  label: string;
  state: OnboardingState;
  required: boolean;
  body: string;
  /** Optional CTA on the card. */
  action?: { label: string; variant: "primary" | "outline" };
  fullWidth?: boolean;
}

export const ONBOARDING_TASKS: OnboardingTask[] = [
  {
    id: "shop-profile",
    label: "Shop profile",
    state: "done",
    required: true,
    body: "Fab City Hamburg e.V. · Hamburg, DE",
  },
  {
    id: "first-listing",
    label: "First listing",
    state: "done",
    required: true,
    body: "Lignum Shredder S1 · 3 variants priced",
  },
  {
    id: "payout-account",
    label: "Payout account",
    state: "todo",
    required: true,
    body: "Verify the entity with Stripe. Takes about 6 minutes.",
    action: { label: "Connect Stripe", variant: "primary" },
  },
  {
    id: "shipping-pickup",
    label: "Shipping & pickup",
    state: "todo",
    required: true,
    body: "One zone and one rate is enough to start.",
    action: { label: "Add a rate", variant: "outline" },
  },
  {
    id: "auto-passports",
    label: "Issue passports automatically",
    state: "optional",
    required: false,
    body: "Every fulfilled order mints a unit-level DPP from your product template. Buyers see it in their profile; you keep the custody chain.",
    fullWidth: true,
  },
];

export const ONBOARDING_PROGRESS = { done: 2, total: 5 };

/* ── Seller dashboard ── */

export const SHOP_KPIS = [
  { label: "Revenue, 30 days", value: "€4,240", sub: "+18% vs previous", subTone: "success" as const },
  { label: "Orders", value: "18", sub: "3 awaiting fulfilment", subTone: "muted" as const },
  { label: "Next payout", value: "€1,908", sub: "Friday, via Stripe", subTone: "muted" as const },
  { label: "Passports issued", value: "15", sub: "3 pending fulfilment", subTone: "dpp" as const },
];

export const SHOP_ORDERS: MockSellerOrderRow[] = [
  {
    id: "IF-2026-0417",
    item: "Lignum Shredder S1",
    variant: "Assembled unit",
    buyer: "Servizio Due",
    status: "Paid",
    statusTone: "green",
    passport: "queued",
    total: "€890.00",
  },
  {
    id: "IF-2026-0411",
    item: "Lignum Shredder S1",
    variant: "Kit of parts",
    buyer: "Fab Lab Torino",
    status: "To fulfil",
    statusTone: "amber",
    passport: "queued",
    total: "€540.00",
  },
  {
    id: "IF-2026-0404",
    item: "Blade set, spare",
    variant: "Pair, hardened",
    buyer: "Makerspace Bologna",
    status: "Shipped",
    statusTone: "green",
    passport: "DPP-0418",
    total: "€120.00",
  },
  {
    id: "IF-2026-0398",
    item: "Lignum Shredder S1",
    variant: "Bill of materials",
    buyer: "R. Marchetti",
    status: "Delivered",
    statusTone: "grey",
    passport: "n/a",
    total: "€35.00",
  },
  {
    id: "IF-2026-0391",
    item: "Shredder S1 service",
    variant: "Blade sharpening",
    buyer: "Fab City Rotterdam",
    status: "Delivered",
    statusTone: "grey",
    passport: "DPP-0402",
    total: "€180.00",
  },
];

export const SHOP_INVENTORY: MockInventoryRow[] = [
  {
    name: "Lignum Shredder S1 · Assembled",
    sku: "LS1-ASM",
    lead: "5 days lead time",
    qty: "12 units",
    qtyTone: "green",
  },
  { name: "Lignum Shredder S1 · Kit", sku: "LS1-KIT", lead: "3 days lead time", qty: "6 units", qtyTone: "green" },
  { name: "Blade set, spare", sku: "LS1-BLD", lead: "made to order", qty: "2 left", qtyTone: "amber" },
];

/* ── Medusa admin mock ── */

export const ADMIN_NAV = ["Overview", "Products", "Orders", "Inventory", "Customers", "Promotions", "Settings"];

export const ADMIN_ROWS: MockAdminRow[] = [
  {
    name: "Lignum Shredder S1",
    variants: "3 variants",
    seller: "Fab City Hamburg",
    status: "Published",
    statusTone: "live",
    stock: "18",
    resource: "er_01HX9…f3a2",
  },
  {
    name: "Blade set, spare",
    variants: "1 variant",
    seller: "Fab City Hamburg",
    status: "Published",
    statusTone: "live",
    stock: "2",
    resource: "er_01HX9…b71c",
  },
  {
    name: "CNC milling — hourly",
    variants: "4 slots",
    seller: "Makerspace Bologna",
    status: "Published",
    statusTone: "live",
    stock: "∞",
    resource: "er_01HXA…9d40",
  },
  {
    name: "Open Shredder v3 · BOM",
    variants: "1 variant",
    seller: "Fab City Hamburg",
    status: "Published",
    statusTone: "live",
    stock: "∞",
    resource: "er_01HX9…21ef",
  },
  {
    name: "Filament, recycled PET",
    variants: "2 variants",
    seller: "Fab Lab Torino",
    status: "Draft",
    statusTone: "draft",
    stock: "—",
    resource: "er_01HXB…7a05",
  },
];

export const ADMIN_WEBHOOKS = [
  { event: "order.placed", effect: "zenflows economic event (transfer)" },
  { event: "order.fulfilled", effect: "mint unit DPP, notify buyer inbox" },
  { event: "payout.paid", effect: "wallet ledger entry, seller track record" },
];

export const ADMIN_OPEN_QUESTIONS = [
  "One Medusa instance per federated node, or one shared with sales channels per node?",
  "Who is the merchant of record for VAT — the node or each maker?",
  "Do services (machine time) become products with a booking window, or a separate module?",
];
