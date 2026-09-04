// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
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

import { ChevronDownIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

type Locale = { code: string; label: string; flag: string };

// Endonyms — a language is conventionally listed in its own tongue, so these
// are intentionally not run through i18n.
const LOCALES: Locale[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

const LocationMenu = ({ className }: { className?: string }) => {
  const router = useRouter();
  const { pathname, asPath, query, locale } = router;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const active = LOCALES.find(l => l.code === locale) ?? LOCALES[0];

  const handleSelect = (code: string) => {
    setOpen(false);
    if (code === locale) return;
    router.push({ pathname, query }, asPath, { locale: code });
  };

  // Click outside / Escape closes the menu, matching UserDropdown.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // A locale change is a route change — make sure the menu is closed after it.
  useEffect(() => {
    const close = () => setOpen(false);
    router.events.on("routeChangeComplete", close);
    return () => router.events.off("routeChangeComplete", close);
  }, [router.events]);

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${active.label}`}
        className="flex items-center gap-1.5 shrink-0 bg-transparent border border-[var(--ifr-border)] cursor-pointer transition-colors hover:bg-[var(--ifr-bg-hover)]"
        style={{
          height: "var(--ifr-control-height)",
          padding: "0 8px",
          borderRadius: "var(--ifr-radius-sm)",
          fontFamily: "var(--ifr-font-body)",
          fontSize: "var(--ifr-fs-sm)",
          fontWeight: "var(--ifr-fw-medium)",
          color: "var(--ifr-text-primary)",
        }}
      >
        <span aria-hidden className="text-base leading-none">
          {active.flag}
        </span>
        <span className="hidden uppercase sm:inline">{active.code}</span>
        <ChevronDownIcon className="h-3.5 w-3.5" style={{ color: "var(--ifr-text-secondary)" }} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+6px)] z-50 overflow-hidden bg-[var(--ifr-bg-surface)]"
          style={{
            minWidth: "180px",
            borderRadius: "var(--ifr-radius-sm)",
            border: "1px solid var(--ifr-border)",
            boxShadow: "var(--ifr-shadow-dropdown)",
            fontFamily: "var(--ifr-font-body)",
          }}
        >
          {LOCALES.map(l => {
            const isActive = l.code === locale;
            return (
              <button
                key={l.code}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => handleSelect(l.code)}
                className={`flex w-full cursor-pointer items-center gap-2.5 border-none px-3 py-2 transition-colors ${
                  isActive ? "bg-[var(--ifr-bg-hover)]" : "bg-transparent hover:bg-[var(--ifr-bg-hover-light)]"
                }`}
                style={{
                  fontSize: "var(--ifr-fs-base)",
                  fontWeight: isActive ? "var(--ifr-fw-medium)" : "var(--ifr-fw-regular)",
                  color: "var(--ifr-text-primary)",
                }}
              >
                <span aria-hidden className="text-base leading-none">
                  {l.flag}
                </span>
                <span className="flex-1 text-left">{l.label}</span>
                <span className="uppercase text-[var(--ifr-text-secondary)]" style={{ fontSize: "var(--ifr-fs-sm)" }}>
                  {l.code}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LocationMenu;
