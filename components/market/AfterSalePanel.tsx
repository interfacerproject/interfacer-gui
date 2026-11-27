// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// After-sale for one order, for its buyer or its seller (Medusa decides which):
// - buyer: ask to cancel (before delivery/build) or to return (within the
//   return window), follow the request, withdraw it; see refunds.
// - seller: accept or decline a request, confirm a returned item arrived and
//   how much is refunded, refund on their own. Refunds are made on the seller's
//   Stripe account and Interfacer's commission is given back in proportion.
// Every action is signed with the person's own key.

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import type { MarketClient } from "lib/market/client";
import { useAuth } from "hooks/useAuth";
import { useInBoxContext } from "hooks/useInBox";
import { aftersaleNotice, sendMarketNotice, type AfterSaleEvent } from "lib/market/notify";
import type { AfterSaleCase, AfterSaleView, CaseStatus } from "lib/market/types";
import { eurCents } from "lib/market/format";
import { Eyebrow, Panel, StatusChip, secondaryButton } from "components/market/ui";

const OPEN: CaseStatus[] = ["requested", "accepted", "returned"];
const input = "px-3 py-2 rounded-[6px] border border-ifr bg-ifr-surface text-[14px] font-normal w-full box-border";
const small = "h-10 px-4 rounded-[6px] font-semibold text-[14px] disabled:opacity-60";

export function useAfterSaleReasons() {
  const { t } = useTranslation("common");
  return (reason: string): string =>
    ({
      cancellation_after_handover: t("It has already been handed over: ask for a return instead."),
      return_before_handover: t("You can ask for a return once it has been handed over to you."),
      return_window_closed: t("The return period for this order has ended."),
      aftersale_case_open: t("There is already an open request on this order."),
      order_fully_refunded: t("This order has been refunded in full."),
      order_canceled: t("This order was cancelled."),
      captured_payment_required: t("The payment for this order is not complete yet."),
      refund_exceeds_payment: t("That is more than what is left to refund."),
      partial_refund_note_required: t("Say why the refund is partial."),
      aftersale_reject_reason_required: t("Say why you decline the request."),
      aftersale_transition_forbidden: t("This request has already moved on. Reload the page."),
      aftersale_cancellation_pending: t("Answer the buyer's cancellation request first."),
    }[reason] ?? t("Something went wrong ({{reason}}).", { reason }));
}

function useCaseLabels() {
  const { t } = useTranslation("common");
  return {
    kind: (c: AfterSaleCase) => (c.kind === "cancellation" ? t("Cancellation") : t("Return")),
    status: (c: AfterSaleCase, role: "buyer" | "seller"): [string, "amber" | "green" | "grey" | "red" | "blue"] => {
      switch (c.status) {
        case "requested":
          return [role === "buyer" ? t("Waiting for the seller") : t("Needs your answer"), "amber"];
        case "accepted":
          return c.kind === "return"
            ? [role === "buyer" ? t("Accepted: send it back") : t("Waiting for the item"), "blue"]
            : [t("Accepted"), "blue"];
        case "returned":
          return [t("Item returned"), "blue"];
        case "refunded":
          return [c.kind === "cancellation" ? t("Cancelled") : t("Refunded"), "green"];
        case "rejected":
          return [t("Declined"), "red"];
        default:
          return [t("Withdrawn"), "grey"];
      }
    },
  };
}

export function AfterSalePanel({
  client,
  orderId,
  onChange,
  compact = false,
  item,
}: {
  client: MarketClient;
  orderId: string;
  onChange?: () => void;
  compact?: boolean;
  // What the order is about, for the inbox notice to the other party.
  item?: { id: string; name: string };
}) {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const { sendMessage } = useInBoxContext();
  const explain = useAfterSaleReasons();
  const labels = useCaseLabels();
  const [view, setView] = useState<AfterSaleView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<null | "cancellation" | "return" | "refund" | "decline" | "returned">(null);
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");

  const load = useCallback(async () => {
    const res = await client.aftersale(orderId);
    if (res.ok) setView(res.data);
    else setError(res.reason);
  }, [client, orderId]);
  useEffect(() => {
    load();
  }, [load]);

  const run = async (
    action: () => Promise<{ ok: boolean; reason?: string }>,
    notice?: { event: AfterSaleEvent; caseKind: "cancellation" | "return" | "refund"; amountCents?: number }
  ) => {
    setBusy(true);
    setError(null);
    const res = await action();
    setBusy(false);
    if (!res.ok) return setError(res.reason ?? "market_error");
    // Tell the other party (best-effort; never blocks the step just signed).
    if (notice && view)
      await sendMarketNotice(
        sendMessage,
        aftersaleNotice({
          ...notice,
          kind: view.kind,
          orderId,
          itemId: item?.id ?? "",
          itemName: item?.name ?? "",
          actorName: user?.name ?? "",
          receiverId: view.counterpart_person_id,
        }),
        user?.ulid
      );
    setForm(null);
    setText("");
    setAmount("");
    await load();
    onChange?.();
  };

  if (!view)
    return error ? (
      <p className="m-0 text-[13px] text-ifr-text-secondary">{explain(error)}</p>
    ) : (
      <div className="h-[80px] animate-pulse bg-ifr-surface" />
    );

  const open = view.cases.find(c => OPEN.includes(c.status));
  const remaining = view.paid_cents - view.refunded_cents;
  const cents = Math.round(Number(amount.replace(",", ".")) * 100);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (form === "cancellation" || form === "return")
      return run(() => client.openCase(orderId, form, text.trim()), { event: "requested", caseKind: form });
    if (form === "decline" && open)
      return run(() => client.respondCase(orderId, open.id, "reject", text.trim()), {
        event: "rejected",
        caseKind: open.kind,
      });
    if (form === "returned" && open)
      return run(() => client.confirmReturn(orderId, open.id, cents, text.trim()), {
        event: "refunded",
        caseKind: "return",
        amountCents: cents,
      });
    if (form === "refund")
      return run(() => client.refund(orderId, cents, text.trim()), {
        event: "refunded",
        caseKind: "refund",
        amountCents: cents,
      });
  };

  const body = (
    <div className="flex flex-col gap-3" data-testid="market-aftersale" data-role={view.role}>
      {view.cases.length ? (
        <ul className="m-0 p-0 list-none flex flex-col gap-2">
          {view.cases.map(c => {
            const [label, tone] = labels.status(c, view.role);
            return (
              <li key={c.id} className="flex flex-col gap-1 text-[14px]" data-testid="market-aftersale-case">
                <span className="flex flex-wrap items-center gap-2">
                  <strong>{labels.kind(c)}</strong>
                  <StatusChip tone={tone} testid="market-aftersale-status">
                    {label}
                  </StatusChip>
                  <span className="text-[12px] text-ifr-text-secondary">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </span>
                <span className="text-ifr-text-secondary">{t("“{{text}}”", { text: c.reason })}</span>
                {c.seller_note ? (
                  <span className="text-ifr-text-secondary">{t("Seller: “{{text}}”", { text: c.seller_note })}</span>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      {view.refunds.length ? (
        <dl className="m-0 flex flex-col gap-1 text-[14px]">
          {view.refunds.map(r => (
            <div key={r.id} className="flex justify-between gap-3">
              <dt className="text-ifr-text-secondary">
                {[
                  t("Refund"),
                  new Date(r.created_at).toLocaleDateString(),
                  r.status !== "done" ? t("in progress") : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </dt>
              <dd className="m-0 font-semibold" data-testid="market-aftersale-refund">
                {"−" + eurCents(r.amount_cents)}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {error ? (
        <p role="alert" className="m-0 text-[13px]" style={{ color: "#9a1f16" }}>
          {explain(error)}
        </p>
      ) : null}

      {form ? (
        <form onSubmit={submit} className="flex flex-col gap-2">
          {form === "returned" || form === "refund" ? (
            <label className="flex flex-col gap-1 text-[13px] font-semibold">
              {t("Amount to refund (up to {{max}})", { max: eurCents(remaining) })}
              <input
                required
                inputMode="decimal"
                className={input}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                data-testid="market-aftersale-amount"
              />
            </label>
          ) : null}
          <label className="flex flex-col gap-1 text-[13px] font-semibold">
            {form === "cancellation" || form === "return"
              ? t("Tell the seller why")
              : form === "decline"
              ? t("Tell the buyer why")
              : form === "returned"
              ? t("Note for the buyer (needed for a partial refund)")
              : t("Reason")}
            <textarea
              required={form !== "returned"}
              maxLength={2000}
              rows={2}
              className={input}
              value={text}
              onChange={e => setText(e.target.value)}
              data-testid="market-aftersale-text"
            />
          </label>
          <span className="flex gap-2">
            <button
              type="submit"
              disabled={busy || ((form === "returned" || form === "refund") && !(cents > 0 && cents <= remaining))}
              className={small + " bg-ifr-green text-white"}
              data-testid="market-aftersale-submit"
            >
              {busy ? t("Signing…") : t("Sign and send")}
            </button>
            <button type="button" className={small + " border border-ifr"} onClick={() => setForm(null)}>
              {t("Back")}
            </button>
          </span>
        </form>
      ) : (
        <div className="flex flex-wrap gap-2">
          {view.role === "buyer" ? (
            <>
              {view.can.cancellation?.ok ? (
                <button
                  type="button"
                  className={secondaryButton}
                  onClick={() => setForm("cancellation")}
                  data-testid="market-aftersale-cancel"
                >
                  {t("Ask to cancel")}
                </button>
              ) : null}
              {view.can.return?.ok ? (
                <button
                  type="button"
                  className={secondaryButton}
                  onClick={() => setForm("return")}
                  data-testid="market-aftersale-return"
                >
                  {t("Ask to return")}
                </button>
              ) : null}
              {open && (open.status === "requested" || (open.kind === "return" && open.status === "accepted")) ? (
                <button
                  type="button"
                  className={secondaryButton}
                  disabled={busy}
                  onClick={() =>
                    run(() => client.withdrawCase(orderId, open.id), { event: "withdrawn", caseKind: open.kind })
                  }
                >
                  {t("Withdraw my request")}
                </button>
              ) : null}
            </>
          ) : (
            <>
              {open?.status === "requested" ? (
                <>
                  <button
                    type="button"
                    className={small + " bg-ifr-green text-white"}
                    disabled={busy}
                    onClick={() =>
                      run(
                        () => client.respondCase(orderId, open.id, "accept", ""),
                        open.kind === "cancellation"
                          ? view.captured
                            ? { event: "refunded", caseKind: "cancellation", amountCents: remaining }
                            : { event: "accepted", caseKind: "cancellation" }
                          : { event: "accepted", caseKind: "return" }
                      )
                    }
                    data-testid="market-aftersale-accept"
                  >
                    {busy
                      ? t("Signing…")
                      : open.kind === "cancellation"
                      ? view.captured
                        ? t("Accept and refund {{amount}}", { amount: eurCents(remaining) })
                        : t("Accept and cancel (nothing was charged)")
                      : t("Accept the return")}
                  </button>
                  <button type="button" className={secondaryButton} onClick={() => setForm("decline")}>
                    {t("Decline")}
                  </button>
                </>
              ) : null}
              {open?.kind === "return" && open.status === "accepted" ? (
                <button
                  type="button"
                  className={small + " bg-ifr-green text-white"}
                  onClick={() => {
                    setAmount((remaining / 100).toFixed(2));
                    setForm("returned");
                  }}
                  data-testid="market-aftersale-returned"
                >
                  {t("Item received back: refund")}
                </button>
              ) : null}
              {!open && view.can.refund ? (
                <button
                  type="button"
                  className={secondaryButton}
                  onClick={() => setForm("refund")}
                  data-testid="market-aftersale-refund-button"
                >
                  {t("Refund")}
                </button>
              ) : null}
            </>
          )}
        </div>
      )}

      {view.role === "buyer" && !open && !form ? (
        <p className="m-0 text-[12px] text-ifr-text-secondary">
          {view.can.return?.ok && view.return_until
            ? t("Returns are possible until {{date}}.", { date: new Date(view.return_until).toLocaleDateString() })
            : !view.can.cancellation?.ok && !view.can.return?.ok && view.can.return?.reason
            ? explain(view.can.return.reason)
            : null}
        </p>
      ) : null}
    </div>
  );

  if (compact) return body;
  return (
    <Panel className="p-5 flex flex-col gap-3">
      <Eyebrow>{t("Returns and refunds")}</Eyebrow>
      {body}
    </Panel>
  );
}
