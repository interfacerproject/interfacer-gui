// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// Stripe webhooks for the marketplace. A pilot's Medusa is private (reachable
// only through the GUI), so Stripe calls this route and it forwards the
// request BYTE FOR BYTE to Medusa's native payment webhook, where the
// Stripe-Signature is verified against STRIPE_WEBHOOK_SECRET. This route
// verifies nothing and decides nothing: a forged call fails Medusa's check.
// Configure in Stripe: https://<gui>/api/market-hooks/stripe

import type { NextApiRequest, NextApiResponse } from "next";
import { proxyMode } from "../market/[...path]";

// The raw body is what Stripe signed: Next must not parse it.
export const config = { api: { bodyParser: false } };

const MAX_BYTES = 512 * 1024;
const MEDUSA_HOOK = "hooks/payment/stripe_stripe";

export async function readRaw(req: NextApiRequest, limit = MAX_BYTES): Promise<Uint8Array | null> {
  const chunks: Uint8Array[] = [];
  let size = 0;
  for await (const chunk of req as AsyncIterable<Uint8Array | string>) {
    const bytes = typeof chunk === "string" ? new TextEncoder().encode(chunk) : new Uint8Array(chunk);
    size += bytes.length;
    if (size > limit) return null;
    chunks.push(bytes);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    body.set(c, offset);
    offset += c.length;
  }
  return body;
}

export async function relayStripeWebhook(
  req: NextApiRequest,
  res: NextApiResponse,
  fetchImpl: typeof fetch = fetch,
  env: Record<string, string | undefined> = process.env
): Promise<void> {
  res.setHeader("cache-control", "no-store");
  const mode = proxyMode(env);
  if (!mode) {
    res.status(503).json({ reason: "market_proxy_unconfigured" });
    return;
  }
  if ((req.method ?? "").toUpperCase() !== "POST") {
    res.status(405).json({ reason: "market_method_forbidden" });
    return;
  }
  const signature = req.headers["stripe-signature"];
  if (typeof signature !== "string" || !signature || signature.length > 2000) {
    res.status(400).json({ reason: "stripe_signature_required" });
    return;
  }
  const body = await readRaw(req);
  if (!body) {
    res.status(413).json({ reason: "webhook_too_large" });
    return;
  }
  const headers: Record<string, string> = {
    "content-type": typeof req.headers["content-type"] === "string" ? req.headers["content-type"] : "application/json",
    "stripe-signature": signature,
  };
  if (mode.kind === "pilot") headers["x-interfacer-proxy-key"] = mode.key;
  try {
    const upstream = await fetchImpl(`${mode.upstream}/${MEDUSA_HOOK}`, {
      method: "POST",
      headers,
      body: body as unknown as BodyInit,
    });
    // Stripe only needs the status: 2xx = delivered, anything else = retry later.
    res.status(upstream.status).send(upstream.ok ? "ok" : "rejected");
  } catch {
    res.status(502).json({ reason: "market_upstream_unreachable" });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  return relayStripeWebhook(req, res);
}
