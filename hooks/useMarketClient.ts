// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
import { useMemo } from "react";
import { signGraphQLRequest } from "@dyne/interfacer-client";
import { useAuth } from "./useAuth";
import { createMarketClient } from "../lib/market/client";
import { createMarketWallet } from "../lib/market/wallet";

export function useMarketClient() {
  const { user, client } = useAuth();
  const personId = user?.id;
  const privateKey = user?.privateKey;
  // Remount the client when the account changes. No bearer token, signing key or
  // order state is shared with the next buyer or silently downgraded to demo.
  // The same wallet signs buyer actions and this person's own seller actions.
  return useMemo(
    () =>
      createMarketClient({
        wallet: personId ? createMarketWallet(personId, () => privateKey || "") : undefined,
        // Enforced Zenflows authz: the same request signer the SDK uses for every
        // call, over the exact body Medusa will relay (checked by the client).
        zenflowsSigner: client
          ? async body => (await signGraphQLRequest(body, client.store))["zenflows-sign"]
          : undefined,
      }),
    [personId, privateKey, client]
  );
}
