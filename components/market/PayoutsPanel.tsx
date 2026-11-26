// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// Getting paid, with Stripe Connect direct charges: buyers pay the seller (or
// maker) directly, on their own Stripe account; Stripe deducts Interfacer's
// commission from each payment. Here the seller reads and signs the
// commission, then opens their Stripe account on Stripe's own pages.

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type { MarketClient } from "lib/market/client";
import type { PaymentsOverview } from "lib/market/types";
import { eurCents } from "lib/market/format";
import { Panel, StatusChip, heading, secondaryButton } from "components/market/ui";

export function feeLabel(terms: { fee_bps: number; fee_fixed_cents: number }) {
  const pct = `${(terms.fee_bps / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
  return terms.fee_fixed_cents ? `${pct} + ${eurCents(terms.fee_fixed_cents)}` : pct;
}

export function PayoutsPanel({ client }: { client: MarketClient }) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [data, setData] = useState<PaymentsOverview | null>(null);
  const [country, setCountry] = useState("IT");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await client.payouts();
    if (res.ok) {
      setData(res.data);
      if (res.data.account) setCountry(res.data.account.country);
    } else setError(res.reason);
  }, [client]);
  useEffect(() => {
    load();
  }, [load, router.query.payouts]);

  if (!data || data.provider !== "stripe") return null;
  const account = data.account;
  const ready = !!account?.status.ready && account.terms_current;

  const onboard = async () => {
    setBusy(true);
    setError(null);
    const res = await client.onboardPayouts(country, data.terms);
    setBusy(false);
    if (!res.ok) return setError(res.reason);
    if (res.data.onboarding_url) window.location.assign(res.data.onboarding_url);
    else await load();
  };

  return (
    <Panel>
      <div className="px-[18px] py-4 flex justify-between items-baseline gap-2 border-b border-[#e3e4e6]">
        <h2 className="m-0 text-[17px]" style={heading}>
          {t("Getting paid")}
        </h2>
        <StatusChip tone={ready ? "green" : "amber"} testid="market-payouts-status">
          {ready ? t("Active") : account ? t("To finish") : t("Not set up")}
        </StatusChip>
      </div>
      <div className="px-[18px] py-4 flex flex-col gap-3 text-[14px]" data-testid="market-payouts">
        <p className="m-0 text-ifr-text-secondary">
          {t(
            "Buyers pay you directly, on your own Stripe account. Stripe deducts the {{fee}} marketplace commission from each payment, and its own fees.",
            { fee: feeLabel(data.terms) }
          )}
        </p>
        <p className="m-0 text-ifr-text-secondary">
          {t(
            "Products are charged when you mark them delivered: deliver within {{days}} days of the order, or the payment lapses and the order is cancelled.",
            { days: data.authorization_days }
          )}
        </p>
        {account && !account.terms_current ? (
          <p className="m-0" style={{ color: "#7a5900" }}>
            {t("The commission has changed (now {{fee}}). Accept it to keep selling.", { fee: feeLabel(data.terms) })}
          </p>
        ) : null}
        {account && account.terms_current && !account.status.ready ? (
          <p className="m-0" style={{ color: "#7a5900" }}>
            {t("Stripe still needs some details from you before you can be paid.")}
          </p>
        ) : null}
        {!account ? (
          <label className="flex flex-col gap-1 font-semibold text-[13px]">
            {t("Country of your bank account")}
            <select
              className="h-10 px-2 rounded-[6px] border border-ifr bg-ifr-surface font-normal"
              value={country}
              onChange={e => setCountry(e.target.value)}
            >
              {data.countries.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {!ready ? (
          <label className="flex gap-2 items-start text-[13px]">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1" />
            <span>
              {t("I accept the marketplace commission of {{fee}} per sale (terms {{version}}).", {
                fee: feeLabel(data.terms),
                version: data.terms.terms_version,
              })}
            </span>
          </label>
        ) : null}
        {error ? (
          <p role="alert" className="m-0 text-[13px]" style={{ color: "#9a1f16" }}>
            {t("Something went wrong ({{reason}}).", { reason: error })}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {!ready ? (
            <button
              type="button"
              disabled={busy || !agreed}
              onClick={onboard}
              className="h-11 px-[18px] rounded-[6px] bg-ifr-green text-white font-semibold disabled:opacity-60"
              data-testid="market-payouts-onboard"
            >
              {busy ? t("Signing…") : account ? t("Continue on Stripe") : t("Set up payments with Stripe")}
            </button>
          ) : null}
          {account?.status.details_submitted ? (
            <a href={data.dashboard_url} target="_blank" rel="noopener noreferrer" className={secondaryButton}>
              {t("Open my Stripe dashboard")}
            </a>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}
