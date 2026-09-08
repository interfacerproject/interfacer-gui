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
import { PREVIEW_HATCH, PREVIEW_PURPLE, PREVIEW_PURPLE_TEXT } from "./previewTokens";

/**
 * The only marker: a full-width strip directly above the topbar on every
 * commerce screen, saying the feature is a work in progress and not usable
 * yet. It is NOT sticky on its own — the layout wraps it and the topbar in a
 * single sticky block.
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
      <span
        style={{
          display: "inline-block",
          padding: "3px 10px",
          borderRadius: "9999px",
          background: PREVIEW_PURPLE,
          color: "#fff",
          fontFamily: "var(--ifr-font-body)",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.6px",
          whiteSpace: "nowrap",
        }}
      >
        {t("WORK IN PROGRESS")}
      </span>
      <span
        style={{
          fontFamily: "var(--ifr-font-body)",
          fontSize: "12.5px",
          fontWeight: 500,
          color: PREVIEW_PURPLE_TEXT,
        }}
      >
        {t("Selling and buying on Interfacer is an upcoming feature and is not functional yet.")}
      </span>
    </div>
  );
}
