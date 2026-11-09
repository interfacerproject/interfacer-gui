// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// Start selling: the signed-in person brings THEIR OWN Zenflows resources to
// the marketplace, in three tracks.
// - Service: describe the machines (capabilities, default prices, place), then
//   tick the registered designs it can build, each with setup fee, per-piece
//   price and lead time (a signed build listing; Medusa rechecks the fit).
// - Product: put one unit on sale at a price.
// - Design: publish what it takes to build it, so makers can offer it.
// Every action is signed with the person's wallet; Medusa re-reads the resource
// and checks they own it.

import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "../_app";
import { useAuth } from "hooks/useAuth";
import { useMarketClient } from "hooks/useMarketClient";
import { useMarketResources } from "hooks/useMarketResources";
import { useResourceSpecs } from "hooks/useResourceSpecs";
import type { MarketClient } from "lib/market/client";
import type {
  BuildListing,
  Capabilities,
  CatalogKind,
  LiveCatalog,
  LiveDesign,
  OwnedResource,
  SellerDashboard,
  ServiceData,
} from "lib/market/types";
import { dims, eur, fitChecks, processLabel, tolerance } from "lib/market/format";
import {
  FitChips,
  MarketHero,
  MarketNotice,
  Panel,
  PathTab,
  StatusChip,
  heading,
  mono,
  primaryButton,
} from "components/market/ui";

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, ["common", "signInProps", "SideBarProps"])),
    },
  };
}

const OWNED = `query($me: [ID!], $specs: [ID!]) {
  economicResources(first: 100, filter: { primaryAccountable: $me, conformsTo: $specs }) {
    edges { node { id name conformsTo { id name } onhandQuantity { hasNumericalValue } } }
  }
}`;

const PROCESSES = ["fdm_3d_print", "sla_3d_print", "laser_cutting", "cnc_milling"];

type Track = "service" | "product" | "design";
type FormState = Record<string, string>;

const list = (v: string) =>
  v
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

const inputClass = "h-10 px-3 rounded-[6px] border border-ifr bg-ifr-surface text-[14px] font-normal w-full";

function Field({
  label,
  value,
  onChange,
  testid,
  suffix,
  width,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  testid: string;
  suffix?: string;
  width?: number;
}) {
  return (
    <label
      className="flex flex-col gap-1 text-[12px] font-semibold text-[#3d4250]"
      style={width ? { width } : undefined}
    >
      {label}
      <span className="flex items-center gap-1.5">
        <input className={inputClass} value={value} onChange={e => onChange(e.target.value)} data-testid={testid} />
        {suffix ? <span className="text-[13px] font-normal text-ifr-text-secondary">{suffix}</span> : null}
      </span>
    </label>
  );
}

function Processes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation("common");
  const chosen = list(value);
  const toggle = (p: string) =>
    onChange((chosen.includes(p) ? chosen.filter(x => x !== p) : [...chosen, p]).join(", "));
  return (
    <fieldset className="m-0 p-0 border-0 flex flex-col gap-1.5" style={{ gridColumn: "1 / -1" }}>
      <legend className="p-0 mb-1.5 text-[12px] font-semibold text-[#3d4250]">{t("Processes")}</legend>
      <div className="flex flex-wrap gap-2">
        {PROCESSES.map(p => (
          <label
            key={p}
            className="flex items-center gap-2 h-9 px-3 border border-ifr rounded-[6px] bg-ifr-surface text-[13px] cursor-pointer"
          >
            <input
              type="checkbox"
              checked={chosen.includes(p)}
              onChange={() => toggle(p)}
              style={{ accentColor: "var(--ifr-green)" }}
            />
            {processLabel(p)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const DESIGN_DEFAULTS: FormState = {
  process: "fdm_3d_print",
  materials: "PETG",
  x: "",
  y: "",
  z: "",
  tolerance: "0.3",
  quantity: "1",
};
const SERVICE_DEFAULTS: FormState = {
  processes: "fdm_3d_print",
  materials: "PETG, PLA",
  x: "",
  y: "",
  z: "",
  tolerance: "0.2",
  base: "10",
  unit: "5",
  country: "it",
  city: "",
};

function designForm(doc: any): FormState {
  const r = doc?.requirements;
  return r
    ? {
        process: r.process.join(", "),
        materials: r.materials.join(", "),
        x: String(r.max_dimensions_mm.x),
        y: String(r.max_dimensions_mm.y),
        z: String(r.max_dimensions_mm.z),
        tolerance: String(r.tolerance_mm),
        quantity: String(r.quantity),
      }
    : DESIGN_DEFAULTS;
}

function serviceForm(doc: any): FormState {
  const c = doc?.capabilities;
  return c
    ? {
        processes: c.processes.join(", "),
        materials: c.materials.join(", "),
        x: String(c.build_volume_mm.x),
        y: String(c.build_volume_mm.y),
        z: String(c.build_volume_mm.z),
        tolerance: String(c.min_tolerance_mm),
        base: String(doc.base_price_eur),
        unit: String(doc.per_unit_price_eur),
        country: doc.location.country_code,
        city: doc.location.city,
      }
    : SERVICE_DEFAULTS;
}

// Builds the exact versioned document Medusa validates; nothing is inferred.
function documentFor(kind: CatalogKind, f: FormState) {
  if (kind === "design")
    return {
      schema_version: "interfacer-build-requirements-v1" as const,
      requirements: {
        process: list(f.process),
        materials: list(f.materials),
        max_dimensions_mm: { x: Number(f.x), y: Number(f.y), z: Number(f.z) },
        tolerance_mm: Number(f.tolerance),
        quantity: Number(f.quantity),
      },
    };
  return {
    schema_version: "interfacer-fabrication-capabilities-v1" as const,
    capabilities: {
      processes: list(f.processes),
      materials: list(f.materials),
      build_volume_mm: { x: Number(f.x), y: Number(f.y), z: Number(f.z) },
      min_tolerance_mm: Number(f.tolerance),
    },
    base_price_eur: Number(f.base),
    per_unit_price_eur: Number(f.unit),
    location: { country_code: f.country.trim(), city: f.city.trim() },
  };
}

function Message({ text, testid }: { text: string | null; testid: string }) {
  return text ? (
    <p className="m-0 text-[13px]" role="status" data-testid={testid}>
      {text}
    </p>
  ) : null;
}

// --- design track ---------------------------------------------------------

function DesignCard({
  market,
  resource,
  dash,
  makers,
  onDone,
}: {
  market: MarketClient;
  resource: OwnedResource;
  dash: SellerDashboard;
  makers: number;
  onDone: () => void;
}) {
  const { t } = useTranslation("common");
  const entries = dash.catalog.filter(e => e.zenflows_resource_id === resource.id && e.kind === "design");
  const latest = entries.sort((a, b) => b.revision - a.revision)[0];
  const [form, setForm] = useState<FormState>(() => designForm(latest?.document));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));
  const submit = async () => {
    setBusy(true);
    setMessage(null);
    const res = await market.registerCatalog("design", resource.id, documentFor("design", form));
    setBusy(false);
    setMessage(res.ok ? t("Registered.") : t("Refused: {{reason}}", { reason: res.reason }));
    if (res.ok) onDone();
  };
  return (
    <Panel className="p-5 flex flex-col gap-4">
      <div data-testid="market-offer-design" data-resource={resource.id} className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Link href={`/project/${resource.id}`}>
            <a className="text-[18px] text-ifr-text-primary" style={heading}>
              {resource.name}
            </a>
          </Link>
          {latest ? (
            <StatusChip tone="green" testid="market-offer-registered">
              {makers ? t("Published · {{count}} makers build it", { count: makers }) : t("Published")}
            </StatusChip>
          ) : (
            <StatusChip tone="grey">{t("Not published yet")}</StatusChip>
          )}
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}>
          <Processes value={form.process} onChange={set("process")} />
          <Field
            label={t("Materials")}
            value={form.materials}
            onChange={set("materials")}
            testid="market-offer-field-materials"
          />
          <Field
            label={t("Largest part X")}
            value={form.x}
            onChange={set("x")}
            suffix="mm"
            testid="market-offer-field-x"
          />
          <Field label={t("Y")} value={form.y} onChange={set("y")} suffix="mm" testid="market-offer-field-y" />
          <Field label={t("Z")} value={form.z} onChange={set("z")} suffix="mm" testid="market-offer-field-z" />
          <Field
            label={t("Tolerance ±")}
            value={form.tolerance}
            onChange={set("tolerance")}
            suffix="mm"
            testid="market-offer-field-tolerance"
          />
          <Field
            label={t("Pieces per build")}
            value={form.quantity}
            onChange={set("quantity")}
            testid="market-offer-field-quantity"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className={primaryButton + " h-11"}
            disabled={busy}
            onClick={submit}
            data-testid="market-offer-submit"
          >
            {busy ? t("Signing…") : latest ? t("Update requirements") : t("Publish build requirements")}
          </button>
          <Message text={message} testid="market-offer-message" />
        </div>
      </div>
    </Panel>
  );
}

// --- product track --------------------------------------------------------

function ProductCard({
  market,
  resource,
  dash,
  onDone,
}: {
  market: MarketClient;
  resource: OwnedResource;
  dash: SellerDashboard;
  onDone: () => void;
}) {
  const { t } = useTranslation("common");
  const [price, setPrice] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const listed = dash.listings.some(l => l.catalog_resource_id === resource.id);
  const submit = async () => {
    setBusy(true);
    setMessage(null);
    const res = await market.listProduct(resource.id, Number(price));
    setBusy(false);
    setMessage(res.ok ? t("Listed for sale.") : t("Refused: {{reason}}", { reason: res.reason }));
    if (res.ok) onDone();
  };
  return (
    <Panel className="p-5">
      <div data-testid="market-offer-product" data-resource={resource.id} className="flex flex-wrap items-end gap-4">
        <div className="flex-[1_1_240px] min-w-0 flex flex-col gap-1">
          <Link href={`/project/${resource.id}`}>
            <a className="text-[18px] text-ifr-text-primary" style={heading}>
              {resource.name}
            </a>
          </Link>
          <span className="text-[13px] text-ifr-text-secondary">
            {t("On hand: {{count}}", { count: Number(resource.onhandQuantity?.hasNumericalValue ?? 0) })}
          </span>
        </div>
        {listed ? (
          <StatusChip tone="green" testid="market-offer-listed">
            {t("On sale")}
          </StatusChip>
        ) : (
          <>
            <Field
              label={t("Price (one unit)")}
              value={price}
              onChange={setPrice}
              suffix="EUR"
              width={170}
              testid="market-offer-field-price"
            />
            <button
              type="button"
              className={primaryButton + " h-10"}
              disabled={busy || !price}
              onClick={submit}
              data-testid="market-offer-submit"
            >
              {busy ? t("Signing…") : t("Put one unit on sale")}
            </button>
          </>
        )}
        <div className="basis-full">
          <Message text={message} testid="market-offer-message" />
        </div>
      </div>
    </Panel>
  );
}

// --- service track --------------------------------------------------------

function BuildRow({
  market,
  service,
  design,
  author,
  listing,
  onDone,
}: {
  market: MarketClient;
  service: ServiceData;
  design: LiveDesign;
  author?: string;
  listing?: BuildListing;
  onDone: () => void;
}) {
  const { t } = useTranslation("common");
  const [base, setBase] = useState(String(listing?.base_price_eur ?? service.base_price_eur));
  const [unit, setUnit] = useState(String(listing?.per_unit_price_eur ?? service.per_unit_price_eur));
  const [days, setDays] = useState(String(listing?.lead_days ?? 5));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const live = !!listing?.active;
  const changed =
    !listing ||
    Number(base) !== listing.base_price_eur ||
    Number(unit) !== listing.per_unit_price_eur ||
    Number(days) !== listing.lead_days;
  const total = Number(base) + Number(unit) * design.requirements.quantity;

  const save = async (active: boolean) => {
    setBusy(true);
    setMessage(null);
    const res = await market.setBuildListing({
      service_id: service.id,
      design_id: design.id,
      base_price_eur: Number(base),
      per_unit_price_eur: Number(unit),
      lead_days: Number(days),
      active,
    });
    setBusy(false);
    setMessage(
      res.ok
        ? active
          ? t("Listed. Buyers see you on this design.")
          : t("Paused.")
        : t("Refused: {{reason}}", { reason: res.reason })
    );
    if (res.ok) onDone();
  };

  return (
    <li
      className="bg-ifr-surface flex flex-col"
      style={{
        border: live ? "1px solid var(--ifr-green)" : "1px solid var(--ifr-border)",
        boxShadow: live ? "inset 3px 0 0 var(--ifr-green)" : undefined,
      }}
      data-testid="market-build-listing"
      data-design={design.id}
    >
      <div className="flex flex-wrap items-center gap-3.5 px-4 py-3.5">
        <span className="flex-[1_1_240px] min-w-0 flex flex-col gap-1">
          <Link href={`/project/${design.id}`}>
            <a className="text-[16px] text-ifr-text-primary" style={heading}>
              {design.name}
            </a>
          </Link>
          <span className="text-[12px] text-ifr-text-secondary">
            {author ? `${t("by {{name}}", { name: author })} · ` : null}
            <span style={mono}>
              {[
                design.requirements.process.map(processLabel).join(", "),
                design.requirements.materials.join(", "),
                dims(design.requirements.max_dimensions_mm),
                tolerance(design.requirements.tolerance_mm),
                t("{{count}} pieces", { count: design.requirements.quantity }),
              ].join(" · ")}
            </span>
          </span>
        </span>
        {listing ? <StatusChip tone={live ? "green" : "amber"}>{live ? t("Listed") : t("Paused")}</StatusChip> : null}
      </div>
      <div
        className="flex flex-wrap items-end gap-x-4 gap-y-3 px-4 pt-3.5 pb-4 border-t border-[#e3e4e6]"
        style={{ background: "#f6faf8" }}
      >
        <Field
          label={t("Setup fee")}
          value={base}
          onChange={setBase}
          suffix="EUR"
          width={130}
          testid="market-build-field-base"
        />
        <Field
          label={t("Per piece")}
          value={unit}
          onChange={setUnit}
          suffix="EUR"
          width={130}
          testid="market-build-field-unit"
        />
        <Field
          label={t("Ready in")}
          value={days}
          onChange={setDays}
          suffix={t("days")}
          width={130}
          testid="market-build-field-days"
        />
        <span className="flex flex-col text-[12px] text-ifr-text-secondary">
          {t("Buyers pay")}
          <strong className="text-[18px] text-ifr-text-primary" style={heading}>
            {Number.isFinite(total) ? eur(total) : "—"}
          </strong>
        </span>
        <span className="ml-auto flex gap-2">
          {live ? (
            <button
              type="button"
              className="h-10 px-4 rounded-[6px] border border-ifr font-semibold text-[14px]"
              disabled={busy}
              onClick={() => save(false)}
              data-testid="market-build-pause"
            >
              {t("Pause")}
            </button>
          ) : null}
          {!live || changed ? (
            <button
              type="button"
              className={primaryButton + " h-10 text-[14px]"}
              disabled={busy}
              onClick={() => save(true)}
              data-testid="market-build-list-btn"
            >
              {busy ? t("Signing…") : !listing ? t("I can build this") : live ? t("Update") : t("Resume")}
            </button>
          ) : null}
        </span>
        <div className="basis-full">
          <Message text={message} testid="market-build-message" />
        </div>
      </div>
    </li>
  );
}

function ServiceCard({
  market,
  resource,
  dash,
  catalog,
  listings,
  authors,
  onDone,
}: {
  market: MarketClient;
  resource: OwnedResource;
  dash: SellerDashboard;
  catalog: LiveCatalog;
  listings: BuildListing[];
  authors: Record<string, string | undefined>;
  onDone: () => void;
}) {
  const { t } = useTranslation("common");
  const entries = dash.catalog.filter(e => e.zenflows_resource_id === resource.id && e.kind === "service");
  const latest = entries.sort((a, b) => b.revision - a.revision)[0];
  const registered = catalog.services.find(s => s.id === resource.id);
  const [form, setForm] = useState<FormState>(() => serviceForm(latest?.document));
  const [editing, setEditing] = useState(!latest);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setBusy(true);
    setMessage(null);
    const res = await market.registerCatalog("service", resource.id, documentFor("service", form));
    setBusy(false);
    setMessage(res.ok ? t("Registered.") : t("Refused: {{reason}}", { reason: res.reason }));
    if (res.ok) {
      setEditing(false);
      onDone();
    }
  };

  const cap: Capabilities | undefined = registered?.capabilities;
  const rows = useMemo(() => {
    if (!cap) return { fit: [] as LiveDesign[], unfit: [] as LiveDesign[] };
    const fit: LiveDesign[] = [];
    const unfit: LiveDesign[] = [];
    for (const d of catalog.designs) (fitChecks(d.requirements, cap).every(c => c.ok) ? fit : unfit).push(d);
    return { fit, unfit };
  }, [catalog.designs, cap]);
  const mine = listings.filter(l => l.service_id === resource.id);

  return (
    <Panel className="flex flex-col">
      <div
        data-testid="market-offer-service"
        data-resource={resource.id}
        className="p-5 flex flex-col gap-4 border-b border-ifr"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Link href={`/project/${resource.id}`}>
            <a className="text-[18px] text-ifr-text-primary" style={heading}>
              {resource.name}
            </a>
          </Link>
          {latest ? (
            <StatusChip tone="green" testid="market-offer-registered">
              {t("On the marketplace")}
            </StatusChip>
          ) : (
            <StatusChip tone="grey">{t("Step 1 of 2")}</StatusChip>
          )}
        </div>
        {cap && !editing ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3.5 bg-ifr-dark text-ifr-text-inverse">
            <span className="text-[12px] text-ifr-text-inverse-secondary">{t("Your machines")}</span>
            <span className="flex flex-wrap gap-x-3.5 gap-y-1 text-[13px]" style={mono}>
              <span>{cap.processes.map(processLabel).join(", ")}</span>
              <span>{cap.materials.join(" · ")}</span>
              <span>{dims(cap.build_volume_mm)}</span>
              <span>{tolerance(cap.min_tolerance_mm)}</span>
              <span>
                {`${registered?.location.city ?? ""}, ${registered?.location.country_code.toUpperCase() ?? ""}`}
              </span>
            </span>
            <button
              type="button"
              className="ml-auto text-[14px] font-semibold text-ifr-yellow bg-transparent border-0 cursor-pointer"
              onClick={() => setEditing(true)}
            >
              {t("Edit machines")}
            </button>
          </div>
        ) : (
          <>
            <p className="m-0 text-[14px] text-ifr-text-secondary">
              {t("Describe what your machines can do. Matching only uses these facts, never tags.")}
            </p>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}>
              <Processes value={form.processes} onChange={set("processes")} />
              <Field
                label={t("Materials")}
                value={form.materials}
                onChange={set("materials")}
                testid="market-offer-field-materials"
              />
              <Field
                label={t("Build volume X")}
                value={form.x}
                onChange={set("x")}
                suffix="mm"
                testid="market-offer-field-x"
              />
              <Field label={t("Y")} value={form.y} onChange={set("y")} suffix="mm" testid="market-offer-field-y" />
              <Field label={t("Z")} value={form.z} onChange={set("z")} suffix="mm" testid="market-offer-field-z" />
              <Field
                label={t("Best tolerance ±")}
                value={form.tolerance}
                onChange={set("tolerance")}
                suffix="mm"
                testid="market-offer-field-tolerance"
              />
              <Field
                label={t("Default setup fee")}
                value={form.base}
                onChange={set("base")}
                suffix="EUR"
                testid="market-offer-field-base"
              />
              <Field
                label={t("Default per piece")}
                value={form.unit}
                onChange={set("unit")}
                suffix="EUR"
                testid="market-offer-field-unit"
              />
              <Field label={t("City")} value={form.city} onChange={set("city")} testid="market-offer-field-city" />
              <Field
                label={t("Country code")}
                value={form.country}
                onChange={set("country")}
                testid="market-offer-field-country"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className={primaryButton + " h-11"}
                disabled={busy}
                onClick={submit}
                data-testid="market-offer-submit"
              >
                {busy ? t("Signing…") : latest ? t("Save machines") : t("Put this service on the marketplace")}
              </button>
              <Message text={message} testid="market-offer-message" />
            </div>
          </>
        )}
      </div>

      {cap ? (
        <div className="p-5 flex flex-col gap-4" data-testid="market-build-designs">
          <div className="flex flex-col gap-1">
            <h3 className="m-0 text-[20px]" style={heading}>
              {t("Which designs can you build?")}
            </h3>
            <p className="m-0 text-[14px] text-ifr-text-secondary max-w-[64ch]">
              {t(
                "Set your price and lead time for each design your machines fit. Buyers find you on those design pages and order at your price."
              )}{" "}
              {mine.filter(l => l.active).length ? (
                <strong className="text-ifr-text-primary">
                  {t("{{count}} listed", { count: mine.filter(l => l.active).length })}
                </strong>
              ) : null}
            </p>
          </div>
          {rows.fit.length === 0 ? (
            <MarketNotice title={t("No published design fits your machines yet")}>
              {t("Designs appear here as designers publish their build requirements.")}
            </MarketNotice>
          ) : (
            <ul className="m-0 p-0 list-none flex flex-col gap-2.5">
              {rows.fit.map(d => (
                <BuildRow
                  key={d.id}
                  market={market}
                  service={registered as ServiceData}
                  design={d}
                  author={authors[d.id]}
                  listing={mine.find(l => l.design_id === d.id)}
                  onDone={onDone}
                />
              ))}
            </ul>
          )}
          {rows.unfit.length ? (
            <details className="bg-ifr-surface border border-ifr px-4">
              <summary className="cursor-pointer py-3.5 text-[14px] font-semibold">
                {t("{{count}} designs your machines can't build yet", { count: rows.unfit.length })}
              </summary>
              <ul className="m-0 mb-3.5 p-0 list-none flex flex-col gap-1.5">
                {rows.unfit.map(d => (
                  <li
                    key={d.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 bg-ifr-profile"
                  >
                    <span className="text-[14px]">{d.name}</span>
                    <FitChips checks={fitChecks(d.requirements, cap)} />
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      ) : null}
    </Panel>
  );
}

// --- page -----------------------------------------------------------------

const StartSelling: NextPageWithLayout = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { user, client: sdk } = useAuth();
  const market = useMarketClient();
  const specs = useResourceSpecs();
  const [owned, setOwned] = useState<OwnedResource[] | null>(null);
  const [dash, setDash] = useState<SellerDashboard | null>(null);
  const [catalog, setCatalog] = useState<LiveCatalog | null>(null);
  const [listings, setListings] = useState<BuildListing[]>([]);
  const [allListings, setAllListings] = useState<BuildListing[]>([]);
  const [error, setError] = useState<string | null>(null);

  const q = router.query as Record<string, string | undefined>;
  const focus = q.service || q.product || q.design;
  const [track, setTrack] = useState<Track | null>(
    q.service ? "service" : q.product ? "product" : q.design ? "design" : null
  );

  const refresh = useCallback(async () => {
    if (!user) return;
    const [d, c, l, all] = await Promise.all([
      market.sellerDashboard(),
      market.liveCatalog(),
      market.buildListings({ provider: user.ulid, includeInactive: true }),
      market.buildListings(),
    ]);
    if (d.ok) setDash(d.data);
    else setError(d.reason);
    if (c.ok) setCatalog(c.data);
    if (l.ok) setListings(l.data);
    if (all.ok) setAllListings(all.data);
  }, [market, user]);

  useEffect(() => {
    if (!user || !sdk || specs.loading) return;
    let alive = true;
    (async () => {
      const c = await market.connect();
      if (!alive) return;
      if (!c.ok) return setError(c.reason);
      if (!c.data.live) return setError("live_mode_required");
      await refresh();
      try {
        const res = await sdk.graphql.request<any>(OWNED, {
          me: [user.ulid],
          specs: [specs.specProjectDesign.id, specs.specProjectService.id, specs.specProjectProduct.id],
        });
        if (res.errors?.length || !res.data) throw new Error("zenflows_error");
        if (alive) setOwned(res.data.economicResources.edges.map((e: { node: OwnedResource }) => e.node));
      } catch {
        if (alive) setError("zenflows_unreachable");
      }
    })();
    return () => {
      alive = false;
    };
  }, [
    user,
    sdk,
    market,
    specs.loading,
    specs.specProjectDesign.id,
    specs.specProjectService.id,
    specs.specProjectProduct.id,
    refresh,
  ]);

  const byKind = useMemo(() => {
    const out: Record<Track, OwnedResource[]> = { service: [], product: [], design: [] };
    for (const r of owned ?? []) {
      const kind =
        r.conformsTo.id === specs.specProjectDesign.id
          ? "design"
          : r.conformsTo.id === specs.specProjectService.id
          ? "service"
          : r.conformsTo.id === specs.specProjectProduct.id
          ? "product"
          : null;
      if (kind) out[kind].push(r);
    }
    // The resource the person came from first.
    for (const k of Object.keys(out) as Track[]) out[k].sort((a, b) => (a.id === focus ? -1 : b.id === focus ? 1 : 0));
    return out;
  }, [owned, specs.specProjectDesign.id, specs.specProjectService.id, specs.specProjectProduct.id, focus]);

  const active: Track =
    track ??
    (byKind.service.length
      ? "service"
      : byKind.product.length
      ? "product"
      : byKind.design.length
      ? "design"
      : "service");

  const designIds = useMemo(() => (catalog?.designs ?? []).map(d => d.id), [catalog]);
  const { resources } = useMarketResources(designIds);
  const authors = useMemo(() => {
    const out: Record<string, string | undefined> = {};
    for (const id of designIds) out[id] = resources[id]?.owner?.name;
    return out;
  }, [designIds, resources]);

  const makersFor = (designId: string) => allListings.filter(l => l.design_id === designId && l.compatible).length;

  const empty = (kind: Track) => (
    <MarketNotice
      title={
        kind === "service"
          ? t("You have no services yet")
          : kind === "product"
          ? t("You have no products yet")
          : t("You have no designs yet")
      }
      action={
        <Link href={`/create/project/${kind}`}>
          <a className="font-semibold">
            {kind === "service"
              ? t("Create a service")
              : kind === "product"
              ? t("Create a product")
              : t("Create a design")}
          </a>
        </Link>
      }
    >
      {kind === "service"
        ? t("A service is your workshop or fab lab: its machines decide which designs you can build.")
        : kind === "product"
        ? t("Products you own can be put on sale one unit at a time.")
        : t("Publish a design's build requirements so makers can offer to build it.")}
    </MarketNotice>
  );

  return (
    <div className="bg-ifr-profile min-h-full">
      <MarketHero
        eyebrow={t("Marketplace")}
        title={t("Start selling")}
        description={t(
          "Bring your own services, products and designs. Everything you publish is signed by you and stays yours."
        )}
      >
        <div className="flex flex-wrap gap-2">
          <PathTab
            active={active === "service"}
            onClick={() => setTrack("service")}
            title={t("I build things")}
            subtitle={t("Offer your machines and the designs they fit")}
            count={owned ? byKind.service.length : undefined}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden="true"
              >
                <rect x="4" y="3" width="16" height="18" />
                <path d="M4 8h16M10 8v4h4V8M7 17h10" />
              </svg>
            }
            testid="market-track-service"
          />
          <PathTab
            active={active === "product"}
            onClick={() => setTrack("product")}
            title={t("I sell products")}
            subtitle={t("Put finished units on sale")}
            count={owned ? byKind.product.length : undefined}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden="true"
              >
                <path d="M3 8l9-5 9 5v8l-9 5-9-5V8z" />
                <path d="M3 8l9 5 9-5M12 13v8" />
              </svg>
            }
            testid="market-track-product"
          />
          <PathTab
            active={active === "design"}
            onClick={() => setTrack("design")}
            title={t("I publish designs")}
            subtitle={t("Let makers build what you designed")}
            count={owned ? byKind.design.length : undefined}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden="true"
              >
                <path d="M6 3h9l4 4v14H6z" />
                <path d="M15 3v4h4M9 13h7M9 17h5" />
              </svg>
            }
            testid="market-track-design"
          />
        </div>
      </MarketHero>

      <div className="max-w-[1180px] mx-auto px-4 md:px-10 pt-8 pb-20 flex flex-col gap-4" data-testid="market-offer">
        {!user ? (
          <MarketNotice
            title={t("Sign in to start selling")}
            testid="market-login-required"
            action={
              <Link href={{ pathname: "/sign_in", query: { redirect: router.asPath } }}>
                <a className="font-semibold">{t("Sign in")}</a>
              </Link>
            }
          >
            {t("You sign everything you publish with your Interfacer account.")}
          </MarketNotice>
        ) : error ? (
          <MarketNotice tone="error" title={t("Could not load your resources")} testid="market-page-error">
            {error}
          </MarketNotice>
        ) : !owned || !dash || !catalog ? (
          <div className="h-[320px] bg-ifr-surface border border-ifr animate-pulse" />
        ) : byKind[active].length === 0 ? (
          empty(active)
        ) : active === "service" ? (
          byKind.service.map(r => (
            <ServiceCard
              key={r.id}
              market={market}
              resource={r}
              dash={dash}
              catalog={catalog}
              listings={listings}
              authors={authors}
              onDone={refresh}
            />
          ))
        ) : active === "product" ? (
          byKind.product.map(r => <ProductCard key={r.id} market={market} resource={r} dash={dash} onDone={refresh} />)
        ) : (
          byKind.design.map(r => (
            <DesignCard key={r.id} market={market} resource={r} dash={dash} makers={makersFor(r.id)} onDone={refresh} />
          ))
        )}
      </div>
    </div>
  );
};

StartSelling.publicPage = true;

export default StartSelling;
