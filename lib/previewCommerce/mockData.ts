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
 * Sample data for the commerce preview — the upcoming "sell and buy on
 * Interfacer" feature. It is not functional yet: no prices are charged, no
 * stock is reserved, no order is created, nothing is written to zenflows.
 * Content mirrors the DTEC Figma prototype (OLSK products, Srfsh Manufacturing).
 */

export type VariantId = "assembled" | "kit" | "bom";

export interface MockVariant {
  id: VariantId;
  label: string;
  blurb: string;
  price: number;
  stockLine: string;
  leadTime: string;
}

export interface MockProduct {
  slug: string;
  name: string;
  seller: string;
  sellerInitials: string;
  location: string;
  shipsFrom: string;
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
  /** Short line under the name, e.g. "Assembled unit" / "Replacement components". */
  variantLabel: string;
  unitPrice: number;
  quantity: number;
}

export type ChipTone = "green" | "amber" | "grey";

/* ── The product behind the buy block ── */

export const MOCK_PRODUCT: MockProduct = {
  slug: "olsk-large-3d-printer",
  name: "OLSK Large 3D Printer",
  seller: "Srfsh Manufacturing",
  sellerInitials: "S",
  location: "Hamburg, Germany",
  shipsFrom: "Hamburg, Germany",
  listedOn: "listed 12 Mar 2026",
  description:
    "A large-format FDM printer built from the Open Large-format Series Kit design, assembled and tested in Hamburg. Steel frame, 400 × 400 × 500 mm build volume, direct-drive extruder. Available as a finished machine, as a kit of cut parts, or as the bill of materials.",
  tags: ["3d-printing", "open-hardware", "large-format", "fab-city"],
  machinesAndMaterials: "Machines: CNC router, MIG welder · Materials: aluminium extrusion, steel, PETG",
  basedOnDesign: "Open Large-format Series Kit",
  license: "CERN-OHL-S-2.0",
  licensor: "OLSK Collective",
  variants: [
    {
      id: "assembled",
      label: "Assembled unit",
      blurb: "tested, 2-year warranty",
      price: 1249,
      stockLine: "12 in stock",
      leadTime: "ships in 5 days",
    },
    {
      id: "kit",
      label: "Kit of parts",
      blurb: "cut & drilled, you assemble",
      price: 799,
      stockLine: "6 kits in stock",
      leadTime: "ships in 3 days",
    },
    {
      id: "bom",
      label: "Bill of materials",
      blurb: "sourcing list + CAM files",
      price: 39,
      stockLine: "instant download",
      leadTime: "instant download",
    },
  ],
};

export function variantById(id: VariantId): MockVariant {
  return MOCK_PRODUCT.variants.find(v => v.id === id) ?? MOCK_PRODUCT.variants[0];
}

/* ── Cart: one seller, two lines (the printer + a spare-parts set) ── */

export const MOCK_SPARE_PARTS_LINE: MockLine = {
  productSlug: "olsk-spare-parts-set",
  name: "OLSK Spare Parts Set",
  variantLabel: "Replacement components",
  unitPrice: 149,
  quantity: 1,
};

export function makePrinterLine(variantId: VariantId, quantity: number): MockLine {
  const v = variantById(variantId);
  return {
    productSlug: MOCK_PRODUCT.slug,
    name: MOCK_PRODUCT.name,
    variantLabel: v.label,
    unitPrice: v.price,
    quantity,
  };
}

export function seedCartLines(variantId: VariantId, quantity: number): MockLine[] {
  return [makePrinterLine(variantId, quantity), { ...MOCK_SPARE_PARTS_LINE }];
}

/* ── Delivery + totals ── */

export type DeliveryMethodId = "standard" | "express";

export interface DeliveryMethod {
  id: DeliveryMethodId;
  title: string;
  detail: string;
  price: number;
}

export const DELIVERY_METHODS: DeliveryMethod[] = [
  { id: "standard", title: "Standard shipping", detail: "3–5 business days", price: 18 },
  { id: "express", title: "Express shipping", detail: "1–2 business days", price: 35 },
];

export function deliveryMethodById(id: DeliveryMethodId): DeliveryMethod {
  return DELIVERY_METHODS.find(m => m.id === id) ?? DELIVERY_METHODS[0];
}

export interface CartTotals {
  subtotal: number;
  shipping: number;
  total: number;
}

export function computeTotals(lines: MockLine[], deliveryMethod: DeliveryMethodId = "standard"): CartTotals {
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const shipping = deliveryMethodById(deliveryMethod).price;
  return { subtotal, shipping, total: subtotal + shipping };
}

/** Format as `€1,234.00` — thousands separator, two decimals. */
export function formatEur(n: number): string {
  return "€" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/* ── Checkout: prefilled-from-profile address (local state only, never sent) ── */

export const MOCK_ADDRESS = {
  fullName: "Srfsh Manufacturing",
  email: "orders@srfsh.example",
  street: "Zeughausmarkt 26",
  city: "Hamburg",
  postalCode: "20459",
  country: "Germany",
};

export const MOCK_ORDER_ID = "IF-2026-0417";

/* ── Seller: set up selling ── */

export type OnboardingState = "done" | "todo" | "optional";

export interface OnboardingTask {
  id: string;
  label: string;
  state: OnboardingState;
  required: boolean;
  body: string;
  action?: { label: string; variant: "primary" | "outline" };
  link?: string;
  fullWidth?: boolean;
  toggle?: boolean;
}

export const ONBOARDING_TASKS: OnboardingTask[] = [
  {
    id: "seller-details",
    label: "Seller details",
    state: "done",
    required: true,
    body: "Srfsh Manufacturing · Hamburg, Germany",
    link: "View details",
  },
  {
    id: "product-ready",
    label: "Product ready for sale",
    state: "done",
    required: true,
    body: "OLSK Large 3D Printer · 3 variants",
    link: "View product",
  },
  {
    id: "payout-account",
    label: "Payout account",
    state: "todo",
    required: true,
    body: "Add the account where you want to receive payments.",
    action: { label: "Set up payouts", variant: "outline" },
  },
  {
    id: "shipping-fulfilment",
    label: "Shipping & fulfilment",
    state: "todo",
    required: true,
    body: "Add at least one shipping method and fulfilment location.",
    action: { label: "Set up delivery", variant: "outline" },
  },
  {
    id: "auto-passports",
    label: "Issue Digital Product Passports automatically",
    state: "optional",
    required: false,
    body: "Create a product passport for eligible units when an order is fulfilled.",
    fullWidth: true,
    toggle: true,
  },
];

export const ONBOARDING_PROGRESS = { done: 2, total: 4 };

/* ── Seller: sales overview ── */

export const SALES_KPIS = [
  { label: "Orders", value: "18", sub: "3 Awaiting fulfilment", subTone: "amber" as const },
  { label: "Revenue · 30 days", value: "€4,240", sub: "", subTone: "muted" as const },
  { label: "Products for sale", value: "4", sub: "1 low in stock", subTone: "amber" as const },
  { label: "Passports issued", value: "15", sub: "1 pending issuance", subTone: "amber" as const },
];

export interface RecentOrderRow {
  id: string;
  product: string;
  status: string;
  statusTone: ChipTone;
  total: string;
}

export const RECENT_ORDERS: RecentOrderRow[] = [
  { id: "IF-2026-0417", product: "OLSK Large 3D Printer", status: "Paid", statusTone: "green", total: "€1,249" },
  { id: "IF-2026-0411", product: "OLSK Spare Parts Set", status: "To fulfil", statusTone: "amber", total: "€149" },
  { id: "IF-2026-0403", product: "OLSK Laser Cutter Desktop", status: "Paid", statusTone: "green", total: "€849" },
  { id: "IF-2026-0328", product: "Custom CNC Assembly Kit", status: "Shipped", statusTone: "green", total: "€1,993" },
];

/* ── Seller: orders list ── */

export interface OrderRow {
  id: string;
  product: string;
  date: string;
  fulfilment: string;
  fulfilmentTone: ChipTone;
  passport: string;
  passportIsDpp: boolean;
  total: string;
}

export const ORDERS: OrderRow[] = [
  {
    id: "IF-2026-0417",
    product: "OLSK Large 3D Printer",
    date: "7 Sep 2026",
    fulfilment: "To fulfil",
    fulfilmentTone: "amber",
    passport: "Pending",
    passportIsDpp: false,
    total: "€1,249.00",
  },
  {
    id: "IF-2026-0411",
    product: "OLSK Spare Parts Set",
    date: "6 Sep 2026",
    fulfilment: "To fulfil",
    fulfilmentTone: "amber",
    passport: "Pending",
    passportIsDpp: false,
    total: "€149.00",
  },
  {
    id: "IF-2026-0403",
    product: "OLSK Laser Cutter Desktop",
    date: "4 Sep 2026",
    fulfilment: "Shipped",
    fulfilmentTone: "green",
    passport: "DPP-0418",
    passportIsDpp: true,
    total: "€849.00",
  },
  {
    id: "IF-2026-0328",
    product: "Custom CNC Assembly Kit",
    date: "29 Aug 2026",
    fulfilment: "Delivered",
    fulfilmentTone: "green",
    passport: "DPP-0402",
    passportIsDpp: true,
    total: "€1,993.00",
  },
];

export const ORDERS_TOTAL_COUNT = 18;

/* ── Seller: inventory list ── */

export interface InventoryRow {
  product: string;
  variant: string;
  sku: string;
  stock: number;
  reserved: number;
  available: number;
  lowStock: boolean;
  location: string;
}

export const INVENTORY: InventoryRow[] = [
  {
    product: "OLSK Large 3D Printer",
    variant: "Assembled unit",
    sku: "OLSK-3DP-A",
    stock: 12,
    reserved: 1,
    available: 11,
    lowStock: false,
    location: "Hamburg, Germany",
  },
  {
    product: "OLSK Large 3D Printer",
    variant: "Kit of parts",
    sku: "OLSK-3DP-K",
    stock: 6,
    reserved: 0,
    available: 6,
    lowStock: false,
    location: "Hamburg, Germany",
  },
  {
    product: "OLSK Spare Parts Set",
    variant: "Replacement components",
    sku: "OLSK-SPARES",
    stock: 2,
    reserved: 1,
    available: 1,
    lowStock: true,
    location: "Hamburg, Germany",
  },
  {
    product: "OLSK Laser Cutter Desktop",
    variant: "Assembled unit",
    sku: "OLSK-LCD-A",
    stock: 4,
    reserved: 0,
    available: 4,
    lowStock: false,
    location: "Hamburg, Germany",
  },
];
