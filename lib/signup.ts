// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.

export interface SignupInput {
  name: string;
  user: string;
  email: string;
  eddsaPublicKey: string;
  ethereumAddress: string;
  ecdhPublicKey: string;
  reflowPublicKey: string;
  bitcoinPublicKey: string;
}

export interface SignupAgent {
  id: string;
  name: string;
  user: string;
  email: string;
}

export function isSignupAgent(value: unknown): value is SignupAgent {
  if (!value || typeof value !== "object") return false;
  const agent = value as Record<string, unknown>;
  return ["id", "name", "user", "email"].every(
    field => typeof agent[field] === "string" && agent[field].length > 0 && agent[field].length <= 1024
  );
}

/** Only public registration data leaves the browser; persist only after success. */
export async function registerViaSignupApi(
  input: SignupInput,
  store: { setItem(key: string, value: string): void },
  fetcher: typeof fetch = fetch
): Promise<void> {
  const response = await fetcher("/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      name: input.name,
      user: input.user,
      email: input.email,
      eddsaPublicKey: input.eddsaPublicKey,
      ethereumAddress: input.ethereumAddress,
      ecdhPublicKey: input.ecdhPublicKey,
      reflowPublicKey: input.reflowPublicKey,
      bitcoinPublicKey: input.bitcoinPublicKey,
    }),
  });

  if (!response.ok) throw new Error("Registration failed. Please try again later.");
  const result: unknown = await response.json();
  const agent = (result as { agent?: unknown } | null)?.agent;
  if (!isSignupAgent(agent)) throw new Error("Registration failed: invalid response.");

  store.setItem("authId", agent.id);
  store.setItem("authName", agent.name);
  store.setItem("authUsername", agent.user);
  store.setItem("authEmail", agent.email);
}
