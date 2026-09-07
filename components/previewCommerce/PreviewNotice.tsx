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

import { useTranslation } from "next-i18next";
import PreviewBadge from "./PreviewBadge";
import { PREVIEW_PURPLE, PREVIEW_PURPLE_TEXT, PREVIEW_PURPLE_TINT } from "./previewTokens";

interface Props {
  /** Defaults to "Buying is not enabled yet". */
  message?: string;
}

/**
 * Level-2 marker: the dashed purple box shown inside a commerce block (e.g. the
 * buy block) — an `UPCOMING` pill next to a short line.
 */
export default function PreviewNotice({ message }: Props) {
  const { t } = useTranslation("commercePreviewProps");
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 10px",
        border: `1px dashed ${PREVIEW_PURPLE}`,
        borderRadius: "6px",
        background: PREVIEW_PURPLE_TINT,
      }}
    >
      <PreviewBadge kind="upcoming" size="sm" />
      <span
        style={{
          fontFamily: "var(--ifr-font-body)",
          fontSize: "11px",
          fontWeight: 500,
          color: PREVIEW_PURPLE_TEXT,
        }}
      >
        {message ?? t("Buying is not enabled yet")}
      </span>
    </div>
  );
}
