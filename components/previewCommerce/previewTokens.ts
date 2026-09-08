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

import { CSSProperties } from "react";
import { ChipTone } from "lib/previewCommerce/mockData";

/**
 * The one colour that is NOT in `styles/theme.css` on purpose: the work-in-
 * progress marker is intentionally foreign to the Interfacer palette so it
 * can never be mistaken for shipped product UI.
 */
export const PREVIEW_PURPLE = "#8200db";
export const PREVIEW_PURPLE_TEXT = "#5b1b8a";
export const PREVIEW_HATCH = "repeating-linear-gradient(135deg,#f3e6ff 0px,#f3e6ff 14px,#ecdaff 14px,#ecdaff 28px)";

/** Height of the level-1 work-in-progress strip. */
export const PREVIEW_STRIP_MIN_HEIGHT = 39;

export function chipStyle(tone: ChipTone): CSSProperties {
  const map: Record<ChipTone, { background: string; color: string }> = {
    green: { background: "rgba(3,106,83,0.1)", color: "#008060" },
    amber: { background: "#fff5ea", color: "#916a00" },
    grey: { background: "rgba(200,212,229,0.3)", color: "#6c707c" },
  };
  return {
    padding: "3px 9px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: 600,
    whiteSpace: "nowrap",
    ...map[tone],
  };
}
