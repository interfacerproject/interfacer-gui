// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// Pure presentation helpers for the marketplace: money, fabrication terms, the
// fit between a design's requirements and a maker's capabilities, and where an
// order stands. No React, no i18n: callers translate the labels they render.

import type { Capabilities, Order, OrderItem, Receipt, Requirements } from "./types";

export function eur(amount: number): string {
  return "€" + amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Medusa store amounts are major units (EUR), quotes are integer cents.
export function eurCents(cents: number): string {
  return eur(cents / 100);
}

const PROCESSES: Record<string, string> = {
  fdm_3d_print: "FDM 3D printing",
  sla_3d_print: "Resin 3D printing",
  sls_3d_print: "SLS 3D printing",
  laser_cutting: "Laser cutting",
  cnc_milling: "CNC milling",
  cnc_routing: "CNC routing",
};

export function processLabel(id: string): string {
  return PROCESSES[id] ?? id.replace(/_/g, " ");
}

// Short code for chips ("FDM", "LASER"): the first word of the process id.
export function processCode(id: string): string {
  return id.split("_")[0].toUpperCase();
}

export function dims(d: { x: number; y: number; z: number }): string {
  return `${d.x} × ${d.y} × ${d.z} mm`;
}

export function tolerance(mm: number): string {
  return `± ${mm} mm`;
}

export type FitCheck = { key: "process" | "material" | "size" | "tolerance"; label: string; ok: boolean };

// What the buyer sees on each maker: every requirement, met or not.
export function fitChecks(req: Requirements, cap: Capabilities): FitCheck[] {
  return [
    {
      key: "process",
      label: req.process.map(processCode).join(" + "),
      ok: req.process.every(p => cap.processes.includes(p)),
    },
    {
      key: "material",
      label: req.materials.join(" + "),
      ok: req.materials.every(m => cap.materials.includes(m)),
    },
    {
      key: "size",
      label: dims(cap.build_volume_mm),
      ok: (["x", "y", "z"] as const).every(a => req.max_dimensions_mm[a] <= cap.build_volume_mm[a]),
    },
    { key: "tolerance", label: tolerance(cap.min_tolerance_mm), ok: cap.min_tolerance_mm <= req.tolerance_mm },
  ];
}

export type Rejection =
  | { kind: "process"; detail: string }
  | { kind: "material"; detail: string }
  | { kind: "size"; detail: string }
  | { kind: "tolerance"; detail: string }
  | { kind: "unavailable"; detail: string };

// Medusa joins reasons with "; " (see matching.ts rejectionReasons and the live
// catalog exclusions). Unknown reasons stay visible as "unavailable".
export function parseRejection(reason: string): Rejection[] {
  return reason
    .split(";")
    .map(r => r.trim())
    .filter(Boolean)
    .map((r): Rejection => {
      let m = /^wrong_process: missing (.+)$/.exec(r);
      if (m) return { kind: "process", detail: processLabel(m[1]) };
      m = /^missing_material: (.+)$/.exec(r);
      if (m) return { kind: "material", detail: m[1] };
      m = /^too_big: (\w) requires ([\d.]+)mm > ([\d.]+)mm$/.exec(r);
      if (m) return { kind: "size", detail: `${m[2]} mm > ${m[3]} mm` };
      m = /^tolerance: service ([\d.]+)mm > required ([\d.]+)mm$/.exec(r);
      if (m) return { kind: "tolerance", detail: `± ${m[1]} > ± ${m[2]} mm` };
      return { kind: "unavailable", detail: r };
    });
}

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

export type OrderKind = "build" | "stock";

export interface BuildReference {
  design_id: string;
  service_id: string;
  service_provider_person_id: string;
  quote_id: string;
  quantity: number;
}

export function orderLine(order: Order): OrderItem | undefined {
  return order.items?.[0];
}

export function orderKind(order: Order): OrderKind {
  return orderLine(order)?.metadata?.interfacer_build ? "build" : "stock";
}

export function buildReference(order: Order): BuildReference | null {
  const ref = orderLine(order)?.metadata?.interfacer_build;
  return ref && typeof ref === "object" ? (ref as BuildReference) : null;
}

export function orderResourceId(order: Order): string | null {
  const line = orderLine(order);
  const build = buildReference(order);
  if (build) return build.design_id;
  const id = line?.metadata?.interfacer_resource_id;
  return typeof id === "string" ? id : null;
}

export function orderCaptured(order: Order): boolean {
  return !!order.payment_collections?.some(pc => pc.payments?.some(p => !!p.captured_at));
}

// placed → paid → made (handed over; the Interfacer record may still be
// syncing) → recorded (the handover is on the ledger, or local-only).
export type OrderStage = "placed" | "paid" | "made" | "recorded";

export function orderStage(order: Order, receipt: Receipt | null | undefined): OrderStage {
  if (!orderCaptured(order)) return "placed";
  if (!receipt) return "paid";
  if (receipt.zenflows_sync && receipt.zenflows_sync.status !== "done") return "made";
  return "recorded";
}

// Shown on order lists: the order's short human number.
export function orderNumber(order: Order): string {
  return order.display_id != null ? `#${order.display_id}` : order.id.slice(-6).toUpperCase();
}
