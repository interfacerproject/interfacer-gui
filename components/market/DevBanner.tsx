// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.

/* eslint-disable i18next/no-literal-string -- LOCAL DEV marketplace page, intentionally not translated */
import React from "react";

// Loud, always-visible reminder that this is the local dev marketplace: the
// data is seeded, the signing keys are disposable fixtures, and the receipts
// are a labeled local stand-in, NOT a live Zenflows ledger.
const DevBanner = () => (
  <div className="p-4 mb-6 border-l-4 rounded bg-amber-100 border-amber-500 text-amber-900">
    <p className="font-bold">LOCAL DEV marketplace</p>
    <p className="text-sm">
      Seeded demo data · disposable fixture/dev signing keys (real Ed25519, not production) · ValueFlows receipts are a
      labeled local stand-in, not yet written to a live Zenflows ledger. Needs the Medusa app running (
      <code>npm run dev:up</code> in interfacer-medusa).
    </p>
  </div>
);

export default DevBanner;
