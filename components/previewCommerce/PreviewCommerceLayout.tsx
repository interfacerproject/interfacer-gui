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

import Footer from "components/Footer";
import Topbar from "components/partials/topbar/Topbar";
import { CommercePreviewProvider } from "lib/previewCommerce/cart";
import { ReactNode } from "react";
import PreviewStrip from "./PreviewStrip";

interface Props {
  children: ReactNode;
  /**
   * `app` (default): the real Interfacer topbar + footer, with the preview
   * strip above them in one sticky block.
   * `bare`: only the preview strip — used by the Medusa admin mock, which
   * deliberately has its own neutral shell and no Interfacer chrome.
   */
  chrome?: "app" | "bare";
}

/**
 * Page-level layout for `pages/preview/commerce/*`. Set as `Page.getLayout` so
 * it replaces the global `Layout` on these routes only; nothing here touches
 * the global `Layout` or `Topbar`.
 *
 * The strip and the topbar live inside ONE `position: sticky; top: 0` wrapper —
 * the topbar's own `sticky` is neutralised here so the two never fight while
 * the strip's height changes with wrapping.
 */
export default function PreviewCommerceLayout({ children, chrome = "app" }: Props) {
  const bare = chrome === "bare";
  return (
    <CommercePreviewProvider>
      <div className="flex flex-col min-h-screen" style={{ background: bare ? "#fafafa" : "var(--ifr-bg-page)" }}>
        <div className="ifr-preview-chrome sticky top-0 z-50">
          <PreviewStrip />
          {!bare && <Topbar />}
        </div>

        <div className={`max-w-full flex-grow ${bare ? "" : "pb-20"}`}>{children}</div>

        {!bare && <Footer />}
      </div>
    </CommercePreviewProvider>
  );
}
