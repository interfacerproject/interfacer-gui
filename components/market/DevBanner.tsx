// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.

/* eslint-disable i18next/no-literal-string -- LOCAL DEV marketplace page, intentionally not translated */
import React from "react";

// Loud, always-visible reminder that this is the local dev marketplace. Live
// mode: real Zenflows sellers and buyers sign with their own wallets; payments
// are still test payments. Standalone: seeded fixtures and disposable keys.
const DevBanner = ({ live }: { live?: boolean }) => (
  <div className="p-4 mb-6 border-l-4 rounded bg-amber-100 border-amber-500 text-amber-900">
    <p className="font-bold">LOCAL DEV marketplace{live ? " · live Zenflows" : ""}</p>
    {live ? (
      <p className="text-sm">
        Real Interfacer people sell their own Zenflows resources and sign every action with their wallet; there are no
        demo keys. Payments are test payments. LIVE marks a confirmed local Zenflows handover. Not production.
      </p>
    ) : (
      <p className="text-sm">
        Seeded catalog and test payments. Signed-in buyers use their Interfacer wallet; supplier actions use disposable
        demo keys. LIVE marks a confirmed local Zenflows handover; other receipts are local-only. Not production. Start
        Medusa with (<code>npm run dev:up</code> in interfacer-medusa).
      </p>
    )}
  </div>
);

export default DevBanner;
