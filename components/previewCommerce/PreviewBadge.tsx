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
import { PREVIEW_PURPLE } from "./previewTokens";

export type PreviewBadgeKind = "preview" | "upcoming" | "sample" | "mockup" | "mockPayment";

const COPY: Record<PreviewBadgeKind, string> = {
  preview: "PREVIEW · NOT LIVE",
  upcoming: "UPCOMING",
  sample: "SAMPLE DATA",
  mockup: "MOCK-UP",
  mockPayment: "MOCK PAYMENT · NO CARD IS CHARGED",
};

interface Props {
  kind: PreviewBadgeKind;
  /** `sm` is the 9.5px in-card size; `md` (default) is the 10px strip size. */
  size?: "sm" | "md";
}

/** The purple pill that marks every commerce-preview surface as not-real. */
export default function PreviewBadge({ kind, size = "md" }: Props) {
  const { t } = useTranslation("commercePreviewProps");
  const fontSize = size === "sm" ? "9.5px" : "10px";
  return (
    <span
      style={{
        display: "inline-block",
        padding: size === "sm" ? "1px 7px" : "3px 10px",
        borderRadius: "9999px",
        background: PREVIEW_PURPLE,
        color: "#fff",
        fontFamily: "var(--ifr-font-body)",
        fontSize,
        fontWeight: 700,
        letterSpacing: size === "sm" ? "0.5px" : "0.6px",
        lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
    >
      {t(COPY[kind])}
    </span>
  );
}
