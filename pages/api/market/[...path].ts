// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// LOCAL DEV marketplace proxy. The real Interfacer × Medusa commerce endpoints
// live on the Medusa app (default http://localhost:9000) behind a storefront
// guard that only accepts loopback requests whose Host is localhost:9000. A
// browser on the GUI's origin cannot satisfy that, so this server-side route
// forwards an allowlisted set of paths over loopback with the right Host.
//
// Signing stays entirely on Medusa: this proxy never holds a private key and
// never signs. It only forwards the already-produced X-Interfacer-Auth header.
// It forwards ONLY to the single configured upstream and ONLY to an allowlisted
// set of path prefixes — the client cannot choose a target (no SSRF).

import type { NextApiRequest, NextApiResponse } from "next";

const UPSTREAM = process.env.MEDUSA_INTERNAL_URL || "http://localhost:9000";

// Dots, colons and uppercase-scheme characters are excluded, so neither "../"
// traversal nor an absolute "http://" target can pass. Uppercase IS allowed
// because real Medusa ids (order_01M5GW…, variant_…) are uppercase base32.
const ALLOWED =
  /^(dev\/store\/(config|sign|capture|session|prepare|seller)|dev\/interfacer\/[A-Za-z0-9/_-]+|store\/[A-Za-z0-9/_-]+|auth\/customer\/emailpass)$/;

const FORWARD_HEADERS = ["x-interfacer-auth", "x-publishable-api-key", "authorization"];

export async function proxy(
  req: NextApiRequest,
  res: NextApiResponse,
  fetchImpl: typeof fetch = fetch,
  upstream: string = UPSTREAM
): Promise<void> {
  // Preserve Medusa's local-only boundary at the GUI hop too. Otherwise this
  // proxy would make loopback-only fixture credentials/signing remotely usable.
  const host = req.headers.host;
  const origin = req.headers.origin;
  const localSocket = ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(req.socket?.remoteAddress || "");
  res.setHeader("cache-control", "no-store");
  if (process.env.NODE_ENV === "production" || !localSocket || typeof host !== "string" ||
      !/^(localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/.test(host) ||
      (origin && origin !== `http://${host}`) || req.headers["sec-fetch-site"] === "cross-site") {
    res.status(403).json({ reason: "local_marketplace_only" });
    return;
  }
  if (!["GET", "HEAD", "POST"].includes((req.method || "GET").toUpperCase())) {
    res.status(405).json({ reason: "market_method_forbidden" });
    return;
  }
  const raw = (req.query as { path?: string[] | string }).path;
  const parts = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const rest = parts.join("/");
  if (!ALLOWED.test(rest)) {
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

  try {
    const upstreamRes = await fetchImpl(`${upstream}/${rest}${qs}`, {
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
