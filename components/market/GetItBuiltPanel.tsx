// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// "Get it built" on a design's page: the makers who listed this design, each
// with the fit against the design's requirements, their price for the design's
// lot and their lead time. Makers that listed it but no longer fit are shown
// collapsed with the reason. Ordering continues on /market/checkout.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "next-i18next";
import { useAuth } from "hooks/useAuth";
import type { MarketClient } from "lib/market/client";
import type { MatchResult, Requirements } from "lib/market/types";
import { eurCents, fitChecks, parseRejection, processLabel, dims, tolerance } from "lib/market/format";
import { Avatar, FitChips, heading, mono } from "./ui";

export default function GetItBuiltPanel({
  client,
  designId,
  requirements,
}: {
  client: MarketClient;
  designId: string;
  requirements: Requirements;
}) {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    client.match(designId).then(res => {
      if (!alive) return;
      if (!res.ok) return setError(res.reason);
      setResult(res.data);
      setPicked(res.data.matches[0]?.quote.id ?? null);
    });
    return () => {
      alive = false;
    };
  }, [client, designId]);

  const selected = useMemo(() => result?.matches.find(m => m.quote.id === picked) ?? null, [result, picked]);
  const own = selected && user?.ulid === selected.service.provider_person_id;

  return (
    <section aria-labelledby="get-it-built" data-testid="market-get-it-built" className="border-b border-[#c9cccf]">
      <div className="px-4 pt-4 pb-3.5 bg-ifr-dark text-ifr-text-inverse flex flex-col gap-1">
        <p
          className="m-0 uppercase text-ifr-yellow text-[12px] tracking-[0.1em]"
          style={{ ...heading, fontWeight: 500 }}
        >
          {t("Built on demand")}
        </p>
        <h2 id="get-it-built" className="m-0 text-[22px] leading-[28px]" style={heading}>
          {t("Get it built")}
        </h2>
        <p className="m-0 text-[13px] text-ifr-text-inverse-secondary">
          {result
            ? result.matches.length
              ? t("{{count}} makers can build this", { count: result.matches.length })
              : t("No maker builds this yet")
            : error
            ? t("Makers are not available right now")
            : t("Finding makers…")}
        </p>
      </div>

      <dl className="m-0 px-4 py-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px] border-b border-[#e3e4e6]">
        <dt className="text-ifr-text-secondary">{t("Process")}</dt>
        <dd className="m-0 text-right" style={mono}>
          {requirements.process.map(processLabel).join(", ")}
        </dd>
        <dt className="text-ifr-text-secondary">{t("Material")}</dt>
        <dd className="m-0 text-right" style={mono}>
          {requirements.materials.join(", ")}
        </dd>
        <dt className="text-ifr-text-secondary">{t("Largest part")}</dt>
        <dd className="m-0 text-right" style={mono}>
          {dims(requirements.max_dimensions_mm)}
        </dd>
        <dt className="text-ifr-text-secondary">{t("Tolerance")}</dt>
        <dd className="m-0 text-right" style={mono}>
          {tolerance(requirements.tolerance_mm)}
        </dd>
        <dt className="text-ifr-text-secondary">{t("Pieces per build")}</dt>
        <dd className="m-0 text-right" style={mono}>
          {requirements.quantity}
        </dd>
      </dl>

      {result?.matches.length ? (
        <div role="radiogroup" aria-label={t("Choose a maker")} className="px-4 py-3 flex flex-col gap-2.5">
          {result.matches.map(m => {
            const on = m.quote.id === picked;
            const place = [m.service.location?.city, m.service.location?.country_code?.toUpperCase()]
              .filter(Boolean)
              .join(", ");
            return (
              <button
                key={m.quote.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setPicked(m.quote.id)}
                data-testid="market-match-service"
                data-service={m.service.id}
                className="text-left flex flex-col gap-2 p-3 rounded-[6px] cursor-pointer"
                style={{
                  background: on ? "var(--ifr-green-bg)" : "var(--ifr-bg-surface)",
                  border: on ? "2px solid var(--ifr-green)" : "1px solid var(--ifr-border)",
                }}
              >
                <span className="flex items-center gap-2.5 w-full">
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-4 h-4 rounded-full bg-white box-border"
                    style={{ border: on ? "5px solid var(--ifr-green)" : "1.5px solid #8a8e98" }}
                  />
                  <Avatar name={m.service.name} size={30} />
                  <span className="flex-1 min-w-0 flex flex-col">
                    <strong className="text-[14px] leading-[18px] truncate">{m.service.name}</strong>
                    {place ? <span className="text-[12px] text-ifr-text-secondary">{place}</span> : null}
                  </span>
                </span>
                <FitChips checks={fitChecks(requirements, m.service.capabilities)} />
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-[19px]" style={heading}>
                    {eurCents(m.quote.total_price_cents)}
                  </span>
                  {m.listing?.lead_days ? (
                    <span className="text-[12px] text-ifr-text-secondary">
                      {t("ready in {{count}} days", { count: m.listing.lead_days })}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {result?.rejected.length ? (
        <details className="px-4 pb-3">
          <summary className="cursor-pointer py-1.5 text-[12px] text-ifr-text-secondary">
            {t("{{count}} makers can't build it right now", { count: result.rejected.length })}
          </summary>
          <ul className="m-0 mt-1.5 p-0 list-none flex flex-col gap-1.5 text-[12px]">
            {result.rejected.map(r => (
              <li key={r.service.id} className="flex justify-between gap-3 px-2.5 py-2 bg-ifr-profile">
                <span className="truncate">{r.service.name}</span>
                <span className="shrink-0 text-right" style={{ ...mono, color: "#9a1f16" }}>
                  {parseRejection(r.reason)
                    .map(x =>
                      x.kind === "material"
                        ? t("no {{material}}", { material: x.detail })
                        : x.kind === "unavailable"
                        ? t("unavailable")
                        : x.detail
                    )
                    .join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {selected ? (
        <div className="px-4 pt-3 pb-4 bg-ifr-profile border-t border-[#e3e4e6] flex flex-col gap-2.5">
          <dl className="m-0 flex flex-col gap-1 text-[13px]">
            <div className="flex justify-between gap-3">
              <dt className="text-ifr-text-secondary min-w-0">
                {t("{{count}} pieces by {{maker}}", { count: selected.quote.quantity, maker: selected.service.name })}
              </dt>
              <dd className="m-0 font-semibold" style={mono}>
                {eurCents(selected.quote.total_price_cents)}
              </dd>
            </div>
          </dl>
          {own ? (
            <p className="m-0 text-[13px] text-ifr-text-secondary" data-testid="market-own-offer">
              {t("This is your own offer.")}
            </p>
          ) : (
            <Link
              href={{
                pathname: "/market/checkout",
                query: { kind: "build", design: designId, quote: selected.quote.id },
              }}
              passHref
            >
              <a
                className="inline-flex items-center justify-center gap-2 h-12 px-4 rounded-[6px] bg-ifr-green text-white font-semibold text-[15px] text-center no-underline hover:bg-ifr-green-hover"
                data-testid="market-order-build"
              >
                {t("Order this build")}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </a>
            </Link>
          )}
          <p className="m-0 text-[12px] leading-[18px] text-ifr-text-secondary">
            {t("The price is set by the maker. You pay at checkout and the maker starts building.")}
          </p>
        </div>
      ) : null}
    </section>
  );
}
