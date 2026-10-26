// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.

/* eslint-disable i18next/no-literal-string -- LOCAL DEV marketplace page, intentionally not translated */
import React from "react";
import Link from "next/link";

const LINKS = [
  { href: "/market", label: "Catalog" },
  { href: "/market/build", label: "Build on demand" },
  { href: "/market/offer", label: "Offer" },
  { href: "/market/sales", label: "My sales" },
];

// Shared header for the marketplace pages: buy (catalog, build) and sell
// (offer your own Zenflows resources, then fulfil your sales).
const MarketNav = ({ title, current }: { title: string; current: string }) => (
  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
    <h1 className="text-2xl font-bold">Interfacer marketplace — {title}</h1>
    <nav className="flex flex-wrap gap-3 text-sm" aria-label="Marketplace">
      {LINKS.map(l =>
        l.href === current ? (
          <span key={l.href} className="font-semibold" aria-current="page">
            {l.label}
          </span>
        ) : (
          <Link key={l.href} href={l.href}>
            <a className="link link-primary">{l.label}</a>
          </Link>
        )
      )}
    </nav>
  </div>
);

export default MarketNav;
