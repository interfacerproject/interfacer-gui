// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// Where an order stands, for buyers and sellers alike: a status chip, the
// four-step progress bar and the traceability log of signed events.

import { useTranslation } from "next-i18next";
import type { OrderKind, OrderStage } from "lib/market/format";
import type { Receipt } from "lib/market/types";
import { StatusChip, mono } from "./ui";

const STAGES: OrderStage[] = ["placed", "paid", "made", "recorded"];

export function useStageLabel() {
  const { t } = useTranslation("common");
  return (stage: OrderStage, kind: OrderKind) =>
    stage === "placed"
      ? t("Awaiting payment")
      : stage === "paid"
      ? kind === "build"
        ? t("In production")
        : t("Awaiting delivery")
      : stage === "made"
      ? kind === "build"
        ? t("Built · recording")
        : t("Delivered · recording")
      : kind === "build"
      ? t("Built and handed over")
      : t("Delivered");
}

export function StageChip({ stage, kind }: { stage: OrderStage; kind: OrderKind }) {
  const label = useStageLabel();
  const tone = stage === "placed" ? "grey" : stage === "paid" ? "amber" : stage === "made" ? "blue" : "green";
  return (
    <StatusChip tone={tone} testid="market-order-stage">
      {label(stage, kind)}
    </StatusChip>
  );
}

export function ProgressSteps({ stage, kind }: { stage: OrderStage; kind: OrderKind }) {
  const { t } = useTranslation("common");
  const at = STAGES.indexOf(stage);
  const steps = [
    { title: t("Paid"), sub: t("Signed by you") },
    {
      title: kind === "build" ? t("In production") : t("On its way"),
      sub: kind === "build" ? t("The maker builds it") : t("The seller ships it"),
    },
    { title: kind === "build" ? t("Built and handed over") : t("Delivered"), sub: t("Signed by the seller") },
    { title: t("Recorded on Interfacer"), sub: t("Ownership and passport are yours") },
  ];
  // Progress index: placed=0 → step 0 current; paid → step 1 current; made → step 3 current; recorded → all done.
  const current = at === 0 ? 0 : at === 1 ? 1 : at === 2 ? 3 : 4;
  return (
    <ol
      aria-label={t("Order progress")}
      className="m-0 p-0 list-none grid"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}
    >
      {steps.map((s, i) => {
        const done = i < current;
        const now = i === current;
        return (
          <li key={i} aria-current={now ? "step" : undefined} className="flex flex-col gap-2.5 pr-3">
            <span className="flex items-center">
              <span
                className="shrink-0 w-7 h-7 rounded-full box-border flex items-center justify-center"
                style={{
                  background: done ? "var(--ifr-yellow)" : "transparent",
                  border: done ? "none" : now ? "2px solid var(--ifr-yellow)" : "2px solid rgba(255,255,255,0.3)",
                  color: "var(--ifr-bg-dark)",
                }}
              >
                {done ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M2.5 6.5l2.2 2.2 4.8-5" />
                  </svg>
                ) : now ? (
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--ifr-yellow)" }} />
                ) : null}
              </span>
              {i < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="flex-1 h-[2px] ml-2"
                  style={{ background: done ? "var(--ifr-yellow)" : "rgba(255,255,255,0.2)" }}
                />
              ) : null}
            </span>
            <span className="flex flex-col">
              <strong className="text-[15px]" style={{ color: done || now ? "#fff" : "rgba(255,255,255,0.8)" }}>
                {s.title}
              </strong>
              <span className="text-[13px] text-ifr-text-inverse-secondary">{s.sub}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

const SIGNED = (
  <svg
    width="13"
    height="13"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden="true"
  >
    <path d="M8 1.5l5 2.5v4c0 3.2-2.3 5.3-5 6.5-2.7-1.2-5-3.3-5-6.5V4l5-2.5z" />
    <path d="M5.5 8l1.8 1.8L10.5 6.5" />
  </svg>
);

export interface TraceEntry {
  when?: string | null;
  title: string;
  action: string; // ValueFlows action, shown as a mono tag
  detail: string;
  signedBy?: string;
  ids?: Array<[string, string]>; // [label, id] — Zenflows ids for the curious
  upcoming?: boolean;
}

export function TraceLog({ entries }: { entries: TraceEntry[] }) {
  const { t } = useTranslation("common");
  return (
    <ol className="m-0 p-0 list-none bg-ifr-surface border border-ifr" data-testid="market-trace">
      {entries.map((e, i) => (
        <li
          key={i}
          className="grid gap-4 px-5 py-4 [&:not(:last-child)]:border-b border-[#e3e4e6]"
          style={{
            gridTemplateColumns: "104px minmax(0, 1fr)",
            background: e.upcoming ? "var(--ifr-bg-profile)" : undefined,
          }}
        >
          <span className="flex flex-col text-[13px] text-ifr-text-secondary">
            {e.when ? (
              <>
                <span>{new Date(e.when).toLocaleDateString()}</span>
                <span style={mono}>
                  {new Date(e.when).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </>
            ) : (
              <span>{e.upcoming ? t("Next") : ""}</span>
            )}
          </span>
          <span className="flex flex-col gap-1 min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <strong className="text-[15px]" style={{ color: e.upcoming ? "var(--ifr-text-secondary)" : undefined }}>
                {e.title}
              </strong>
              <span
                className="px-1.5 text-[11px] text-ifr-text-secondary"
                style={{ ...mono, border: `1px ${e.upcoming ? "dashed" : "solid"} var(--ifr-border)` }}
              >
                {e.action}
              </span>
            </span>
            <span className="text-[14px]" style={{ color: e.upcoming ? "var(--ifr-text-secondary)" : "#3d4250" }}>
              {e.detail}
            </span>
            {e.signedBy ? (
              <span className="flex items-center gap-1.5 text-[12px]" style={{ color: "#00704f" }}>
                {SIGNED}
                {t("Signed by {{name}}", { name: e.signedBy })}
              </span>
            ) : null}
            {e.ids?.length ? (
              <span className="flex flex-col gap-0.5 text-[11px] text-ifr-text-secondary break-all" style={mono}>
                {e.ids.map(([label, id]) => (
                  <span key={label + id} data-testid="market-zenflows-id">
                    {`${label}: ${id}`}
                  </span>
                ))}
              </span>
            ) : null}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function receiptIds(receipt: Receipt): Array<[string, string]> {
  const s = receipt.zenflows_sync;
  const ids: Array<[string, string]> = [];
  if (s?.process_id) ids.push(["process", s.process_id]);
  if (s?.creation_event_id) ids.push(["produce", s.creation_event_id]);
  if (receipt.zenflows_event_id) ids.push(["transfer", receipt.zenflows_event_id]);
  return ids;
}
