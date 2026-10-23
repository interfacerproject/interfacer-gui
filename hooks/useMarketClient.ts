// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
import { useMemo } from "react";
import { useAuth } from "./useAuth";
import { createMarketClient } from "../lib/market/client";
import { createBuyerWallet } from "../lib/market/wallet";

export function useMarketClient() {
  const { user } = useAuth();
  const personId = user?.id;
  const privateKey = user?.privateKey;
  // Remount the client when the account changes. No bearer token, signing key or
  // order state is shared with the next buyer or silently downgraded to demo.
  return useMemo(() => createMarketClient({
    wallet: personId ? createBuyerWallet(personId, () => privateKey || "") : undefined,
  }), [personId, privateKey]);
}
