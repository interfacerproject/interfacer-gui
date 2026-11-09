// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// Marketplace proxy: the browser's only way to Medusa. It forwards ONLY to the
// single configured upstream and ONLY an allowlisted set of paths, so the
// client cannot choose a target (no SSRF). Signing stays with the user's wallet
// and Medusa: this proxy never holds a private key and never signs. It only
// forwards the already-produced X-Interfacer-Auth header.
//
// Two modes:
// - local (default, never in production): LOCAL DEV. Medusa's storefront guard
//   accepts only loopback requests whose Host is localhost:9000, so this route
//   forwards over loopback, and only for loopback same-origin callers.
// - pilot (MARKET_PROXY_MODE=pilot): a deployed GUI in front of a private
//   Medusa. Same-origin browser requests only; the marketplace and native store
//   paths only (no dev signer, no demo login); every forwarded request carries
//   the shared key (MEDUSA_PROXY_KEY) that the pilot Medusa requires.

import type { NextApiRequest, NextApiResponse } from "next";

// Dots, colons and uppercase-scheme characters are excluded, so neither "../"
// traversal nor an absolute "http://" target can pass. Uppercase IS allowed
// because real Medusa ids (order_01M5GW…, variant_…) are uppercase base32.
const LOCAL_ALLOWED =
  /^(market\/[A-Za-z0-9/_-]+|dev\/store\/(config|sign|capture|session|prepare|seller|zenflows-sync\/[A-Za-z0-9_]+\/(next|sign))|dev\/interfacer\/[A-Za-z0-9/_-]+|store\/[A-Za-z0-9/_-]+|auth\/customer\/emailpass)$/;
const PILOT_ALLOWED = /^(market\/[A-Za-z0-9/_-]+|store\/[A-Za-z0-9/_-]+)$/;

const FORWARD_HEADERS = ["x-interfacer-auth", "x-publishable-api-key", "authorization"];

type Env = Record<string, string | undefined>;
type Mode = { kind: "local"; upstream: string } | { kind: "pilot"; upstream: string; key: string };

export function proxyMode(env: Env = process.env): Mode | null {
  if (env.MARKET_PROXY_MODE === "pilot") {
    const key = env.MEDUSA_PROXY_KEY ?? "";
    return env.MEDUSA_INTERNAL_URL && key.length >= 32
      ? { kind: "pilot", upstream: env.MEDUSA_INTERNAL_URL, key }
      : null;
  }
  if (env.NODE_ENV === "production") return null;
  return { kind: "local", upstream: env.MEDUSA_INTERNAL_URL || "http://localhost:9000" };
}

// Preserve Medusa's local-only boundary at the GUI hop too. Otherwise this
// proxy would make loopback-only fixture credentials/signing remotely usable.
function localCaller(req: NextApiRequest): boolean {
  const host = req.headers.host;
  const origin = req.headers.origin;
  const localSocket = ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(req.socket?.remoteAddress || "");
  return (
    localSocket &&
    typeof host === "string" &&
    /^(localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/.test(host) &&
    (!origin || origin === `http://${host}`) &&
    req.headers["sec-fetch-site"] !== "cross-site"
  );
}

// The GUI's own pages only: a cross-site page cannot drive a signed-in
// buyer's session (the bearer token lives in the page, but be strict anyway).
function sameOriginCaller(req: NextApiRequest): boolean {
  const host = req.headers.host;
  const origin = req.headers.origin;
  const site = req.headers["sec-fetch-site"];
  if (typeof host !== "string" || (site && site !== "same-origin" && site !== "none")) return false;
  if (!origin) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function proxy(
  req: NextApiRequest,
  res: NextApiResponse,
  fetchImpl: typeof fetch = fetch,
  upstream?: string,
  env: Env = process.env
): Promise<void> {
  res.setHeader("cache-control", "no-store");
  const mode = proxyMode(env);
  if (!mode) {
    res.status(env.MARKET_PROXY_MODE === "pilot" ? 503 : 403).json({
      reason: env.MARKET_PROXY_MODE === "pilot" ? "market_proxy_unconfigured" : "local_marketplace_only",
    });
    return;
  }
  if (mode.kind === "local" ? !localCaller(req) : !sameOriginCaller(req)) {
    res.status(403).json({ reason: mode.kind === "local" ? "local_marketplace_only" : "market_same_origin_only" });
    return;
  }
  if (!["GET", "HEAD", "POST"].includes((req.method || "GET").toUpperCase())) {
    res.status(405).json({ reason: "market_method_forbidden" });
    return;
  }
  const raw = (req.query as { path?: string[] | string }).path;
  const parts = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const rest = parts.join("/");
  if (!(mode.kind === "local" ? LOCAL_ALLOWED : PILOT_ALLOWED).test(rest)) {
    res.status(400).json({ reason: "market_path_forbidden" });
    return;
  }

  const qIndex = (req.url ?? "").indexOf("?");
  const qs = qIndex >= 0 ? (req.url as string).slice(qIndex) : "";
  const method = (req.method ?? "GET").toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";

  const headers: Record<string, string> = { "content-type": "application/json" };
  for (const h of FORWARD_HEADERS) {
    const v = req.headers[h];
    if (typeof v === "string") headers[h] = v;
  }
  if (mode.kind === "pilot") headers["x-interfacer-proxy-key"] = mode.key;

  try {
    const upstreamRes = await fetchImpl(`${upstream ?? mode.upstream}/${rest}${qs}`, {
      method,
      headers,
      body: hasBody ? JSON.stringify(req.body ?? {}) : undefined,
    });
    const relayAuth = upstreamRes.headers.get("x-interfacer-auth");
    if (relayAuth) res.setHeader("x-interfacer-auth", relayAuth);
    const text = await upstreamRes.text();
    res.status(upstreamRes.status);
    res.setHeader("content-type", upstreamRes.headers.get("content-type") || "application/json");
    res.send(text);
  } catch {
    res.status(502).json({ reason: "market_upstream_unreachable" });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  return proxy(req, res);
}
