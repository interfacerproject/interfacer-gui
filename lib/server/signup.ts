// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.

import type { NextApiRequest, NextApiResponse } from "next";
import { isSignupAgent, SignupInput } from "../signup";

// Intentionally fixed: callers cannot submit operations, URLs, headers or extra Person fields.
const SIGNUP_MUTATION = `
  mutation SignUp(
    $name: String! $user: String! $email: String!
    $eddsaPublicKey: String! $reflowPublicKey: String!
    $ethereumAddress: String! $ecdhPublicKey: String! $bitcoinPublicKey: String!
  ) {
    createPerson(person: {
      name: $name user: $user email: $email
      eddsaPublicKey: $eddsaPublicKey reflowPublicKey: $reflowPublicKey
      ethereumAddress: $ethereumAddress ecdhPublicKey: $ecdhPublicKey
      bitcoinPublicKey: $bitcoinPublicKey
    }) { agent { id name user email } }
  }
`;

const FIELD_LIMITS: Record<keyof SignupInput, number> = {
  name: 200,
  user: 64,
  email: 254,
  eddsaPublicKey: 2048,
  reflowPublicKey: 2048,
  ethereumAddress: 128,
  ecdhPublicKey: 2048,
  bitcoinPublicKey: 2048,
};

function validateInput(body: unknown): SignupInput | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const input = body as Record<string, unknown>;
  const fields = Object.keys(FIELD_LIMITS) as (keyof SignupInput)[];
  if (
    Object.keys(input).length !== fields.length ||
    Object.keys(input).some(key => !Object.prototype.hasOwnProperty.call(FIELD_LIMITS, key))
  )
    return null;

  const result = {} as SignupInput;
  for (const field of fields) {
    const value = input[field];
    if (
      typeof value !== "string" ||
      !value.trim() ||
      value.length > FIELD_LIMITS[field] ||
      /[\u0000-\u001f\u007f]/.test(value)
    ) {
      return null;
    }
    // Preserve key encodings; do not silently trim or normalize cryptographic data.
    if (field !== "name" && field !== "user" && field !== "email" && !/^[A-Za-z0-9+/=_-]+$/.test(value)) return null;
    result[field] = value;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)) return null;
  return result;
}

interface Dependencies {
  fetcher?: typeof fetch;
  now?: () => number;
  env?: () => { ZENFLOWS_ADMIN?: string; ZENFLOWS_URL?: string };
}

/** Local containment only: enforce shared limits/anti-bot policy at the production ingress. */
export function createSignupHandler({
  fetcher = fetch,
  now = Date.now,
  env = () => ({ ZENFLOWS_ADMIN: process.env.ZENFLOWS_ADMIN, ZENFLOWS_URL: process.env.ZENFLOWS_URL }),
}: Dependencies = {}) {
  const attempts = new Map<string, { count: number; expires: number }>();
  const windowMs = 10 * 60 * 1000;
  const maxAddresses = 10000;

  return async function signup(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader("Cache-Control", "no-store");
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed." });
    }
    if (req.headers["content-type"]?.split(";")[0].trim().toLowerCase() !== "application/json") {
      return res.status(415).json({ error: "Expected application/json." });
    }

    // Never trust caller-supplied X-Forwarded-For. Behind a proxy, this shares its quota.
    const address = req.socket.remoteAddress || "unknown";
    const time = now();
    let attempt = attempts.get(address);
    if (!attempt || attempt.expires <= time) {
      if (attempts.size >= maxAddresses) {
        attempts.forEach((entry, key) => {
          if (entry.expires <= time) attempts.delete(key);
        });
        if (!attempts.has(address) && attempts.size >= maxAddresses) {
          res.setHeader("Retry-After", "600");
          return res.status(429).json({ error: "Too many registration attempts." });
        }
      }
      attempt = { count: 0, expires: time + windowMs };
      attempts.set(address, attempt);
    }
    attempt.count++;
    if (attempt.count > 5) {
      res.setHeader("Retry-After", String(Math.max(1, Math.ceil((attempt.expires - time) / 1000))));
      return res.status(429).json({ error: "Too many registration attempts." });
    }

    const input = validateInput(req.body);
    if (!input) return res.status(400).json({ error: "Invalid registration data." });

    const settings = env();
    const admin = settings.ZENFLOWS_ADMIN;
    let endpoint: URL;
    try {
      endpoint = new URL(settings.ZENFLOWS_URL || "");
      if (
        !["https:", "http:"].includes(endpoint.protocol) ||
        endpoint.username ||
        endpoint.password ||
        !admin?.trim()
      ) {
        throw new Error("Invalid server configuration");
      }
    } catch {
      return res.status(503).json({ error: "Registration is not configured." });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetcher(endpoint.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json", "zenflows-admin": admin! },
        body: JSON.stringify({ query: SIGNUP_MUTATION, operationName: "SignUp", variables: input }),
        redirect: "error",
        signal: controller.signal,
      });
      if (!response.ok) return res.status(502).json({ error: "Registration service unavailable." });

      const result = await response.json();
      if (result?.errors?.length) return res.status(400).json({ error: "Registration could not be completed." });
      const agent = result?.data?.createPerson?.agent;
      if (!isSignupAgent(agent)) return res.status(502).json({ error: "Invalid registration service response." });

      // Whitelist the response: never relay upstream errors, headers or unexpected fields.
      return res.status(201).json({ agent: { id: agent.id, name: agent.name, user: agent.user, email: agent.email } });
    } catch {
      return res.status(502).json({ error: "Registration service unavailable." });
    } finally {
      clearTimeout(timeout);
    }
  };
}
