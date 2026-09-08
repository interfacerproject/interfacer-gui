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

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribe to a CSS media query from React.
 *
 * Prefer plain CSS for anything CSS can express. This is for the cases where
 * the *behaviour* differs, not just the styling — a panel that is an inline
 * column on desktop and a modal drawer on a phone, where the open/closed
 * default is not the same on both.
 *
 * Server rendering has no viewport, so the server snapshot is always `false`;
 * React swaps in the real value on hydration without a mismatch warning.
 */
export default function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => undefined;
      const list = window.matchMedia(query);
      // Safari < 14 only supports the deprecated add/removeListener pair.
      if (list.addEventListener) {
        list.addEventListener("change", onChange);
        return () => list.removeEventListener("change", onChange);
      }
      list.addListener(onChange);
      return () => list.removeListener(onChange);
    },
    [query]
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Tailwind's `lg` breakpoint — the point where side-by-side layouts earn their space. */
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");

/** Tailwind's `md` breakpoint. */
export const useIsTablet = () => useMediaQuery("(min-width: 768px)");
