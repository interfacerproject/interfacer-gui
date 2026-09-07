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
import { PREVIEW_HATCH, PREVIEW_PURPLE, PREVIEW_PURPLE_TEXT, PREVIEW_PURPLE_TEXT_SOFT } from "./previewTokens";

/**
 * Level-1 marker: the full-width hatched strip that sits directly above the
 * topbar on every commerce-preview route. It is NOT sticky on its own — the
 * layout wraps it and the topbar in a single sticky block.
 */
export default function PreviewStrip() {
  const { t } = useTranslation("commercePreviewProps");
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flexWrap: "wrap",
        padding: "9px 24px",
        background: PREVIEW_HATCH,
        borderBottom: `1px dashed ${PREVIEW_PURPLE}`,
      }}
    >
      <PreviewBadge kind="preview" />
      <span
        style={{
          fontFamily: "var(--ifr-font-body)",
          fontSize: "12.5px",
          fontWeight: 500,
          color: PREVIEW_PURPLE_TEXT,
        }}
      >
        {t(
          "Commerce is a mock-up of an upcoming Medusa integration. Products, prices, stock, orders and payments on these screens are sample data — nothing is charged, nothing is shipped."
        )}
      </span>
      <span
        style={{
          marginLeft: "auto",
          fontFamily: "var(--ifr-font-body)",
          fontSize: "11px",
          color: PREVIEW_PURPLE_TEXT_SOFT,
        }}
      >
        {t("design preview · Sep 2026")}
      </span>
    </div>
  );
}
