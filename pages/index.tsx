// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2026 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

/* eslint-disable i18next/no-literal-string --
 * scroll-world homepage prototype: all copy is hardcoded in WORLD_CONFIG;
 * i18n wiring is deferred until the page is finalized. */
import Head from "next/head";
import { useEffect, useRef } from "react";
import { NextPageWithLayout } from "./_app";

/**
 * Scroll-world homepage: scroll scrubs a pre-rendered, seamless camera flight
 * through the Interfacer world (locked-isometric glide, architecture A — the
 * legs ARE the journey, no connectors). Engine: lib/scroll-world/scrub-engine.js
 */

const WORLD_CONFIG = {
  brand: { name: "INTERFACER", href: "#top" },
  diveScroll: 1.3,
  connScroll: 0.9,
  crossfade: 0.08, // architecture A: legs hand off frame-identically; small dissolve
  hint: "scroll to fly the world",
  sections: [
    {
      id: "commons",
      label: "The Commons",
      still: "/sw/commons.webp",
      clip: "/sw/vid/commons.mp4",
      accent: "#036a53",
      scroll: 1.6,
      eyebrow: "Open by design",
      title: "Every design, free to study and remix.",
      body: "Import from git, LOSH or Thingiverse — files, licenses and history stay in the commons.",
      tags: ["CERN-OHL", "Import from LOSH"],
    },
    {
      id: "fablab",
      label: "The FabLab",
      still: "/sw/fablab.webp",
      clip: "/sw/vid/fablab.mp4",
      accent: "#e5a100",
      eyebrow: "Made near you",
      title: "Local labs turn files into things.",
      body: "Filter by machines, materials and repairability — then manufacture with a lab around the corner.",
      tags: ["3D printing", "CNC", "Laser cut"],
    },
    {
      id: "passport",
      label: "The Passport",
      still: "/sw/passport.webp",
      clip: "/sw/vid/passport.mp4",
      accent: "#eb7b35",
      eyebrow: "Every part, accounted for",
      title: "A passport for everything you make.",
      body: "Digital Product Passports trace components, processes and recycling — batch by batch, unit by unit.",
      tags: ["Traceability", "Recycling"],
    },
    {
      id: "map",
      label: "The Map",
      still: "/sw/map.webp",
      clip: "/sw/vid/map.mp4",
      accent: "#5da091",
      eyebrow: "A city that makes",
      title: "Find makers and labs near you.",
      body: "A federated network of Fab Cities — search projects, experts and labs on the map.",
      tags: ["Fab Cities", "Geolocation"],
    },
    {
      id: "wallet",
      label: "The Wallet",
      still: "/sw/wallet.webp",
      clip: "/sw/vid/wallet.mp4",
      accent: "#e5a100",
      eyebrow: "Value returns to makers",
      title: "Contribution, rewarded.",
      body: "A password-less W3C-DID wallet — activity earns points that convert to tokens.",
      tags: ["W3C-DID", "Password-less"],
    },
    {
      id: "world",
      label: "The World",
      still: "/sw/world.webp",
      clip: "/sw/vid/world.mp4",
      accent: "#014837",
      scroll: 1.6,
      eyebrow: "Digital infrastructure for Fab Cities",
      title: "Produce what you consume, together.",
      body: "Join the open source hardware community — share, manufacture, trace and thrive.",
      tags: ["Open hardware"],
      cta: {
        primary: { label: "Explore the catalogue", href: "/products" },
        secondary: { label: "Join Interfacer", href: "/sign_up" },
      },
    },
  ],
  connectors: [], // architecture A — no connectors; seams are frame-identical handoffs
  // mobile chain (clipMobile/stillMobile, native 9:16) frozen by user decision 2026-08-06 — render later
};

const Home: NextPageWithLayout = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const { mountScrollWorld } = require("../lib/scroll-world/scrub-engine.js");
    const api = mountScrollWorld(ref.current, WORLD_CONFIG);
    return () => api?.unmount?.();
  }, []);

  return (
    <>
      <Head>
        <title>Interfacer — the open source hardware commons</title>
        <meta
          name="description"
          content="A federated open source platform to share, manufacture and trace open hardware — from the commons to your city."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <style>{`
          :root {
            --sw-bg: #e9e9e8;
            --sw-ink: #0b1324;
            --sw-ink-soft: #4b5563;
            --sw-accent: #036a53;
            --sw-font-display: "Space Grotesk", sans-serif;
            --sw-font-body: "IBM Plex Sans", sans-serif;
          }
          html, body { background: #e9e9e8; }
          /* Tailwind preflight (unlayered img,video{height:auto;max-width:100%}) beats the
             engine's @layer sw box rules — restore full-bleed stage media. */
          .sw-stage video, .sw-stage img { width: 100%; height: 100%; max-width: none; object-fit: cover; }
          /* Preflight (unlayered) beats @layer sw on a few rules — restore them. */
          .sw-btn--primary { color: #fff; background: var(--sw-ink); }
          .sw-btn--ghost { color: var(--sw-ink); border: 1.5px solid rgba(11, 19, 36, 0.25); }
          .sw-nav__item.is-active { color: #fff; background: var(--sw-accent); }
        `}</style>
      </Head>
      <div id="world" ref={ref} />
    </>
  );
};

Home.publicPage = true;
Home.getLayout = page => page;

export default Home;
