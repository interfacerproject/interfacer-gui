// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// The marketplace needs a reachable Medusa behind the local-only /api/market
// proxy, so its entry points (navigation, project-page panels) are opt-in.
export const marketplaceEnabled = process.env.NEXT_PUBLIC_FF_MARKETPLACE === "true";
