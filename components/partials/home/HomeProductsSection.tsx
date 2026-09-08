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

/** "Prefer the finished thing?" products teaser — DTEC prototype node 943:60952. */

import classNames from "classnames";
import { useResourceSpecs } from "hooks/useResourceSpecs";
import { useTranslation } from "next-i18next";
import HomeProjectsGrid from "./HomeProjectsGrid";
import { HomeButton, headH1, textLg } from "./primitives";

export default function HomeProductsSection() {
  const { t } = useTranslation("homeProps");
  const { specProjectProduct } = useResourceSpecs();

  return (
    <section className="flex w-full flex-wrap items-stretch bg-ifr-dark">
      <div className="flex min-w-[min(100%,480px)] flex-1 flex-col gap-6 p-6 md:p-10 xl:p-16">
        <HomeProjectsGrid
          conformsTo={specProjectProduct.id || undefined}
          count={2}
          className="grid grid-cols-1 gap-6 2xl:grid-cols-2"
        />
        <div className="flex justify-center">
          <HomeButton href="/products" size="lg">
            {t("More products")}
          </HomeButton>
        </div>
      </div>

      <div className="flex min-w-[min(100%,420px)] flex-1 flex-col justify-center gap-4 p-6 md:p-10 xl:p-20">
        <h2 className={classNames(headH1, "text-ifr-text-inverse")}>{t("Prefer the finished thing?")}</h2>
        <p className={classNames(textLg, "text-ifr-text-secondary")}>
          {t(
            "Some open designs are already being manufactured. Explore physical products and find out who makes them."
          )}
        </p>
      </div>
    </section>
  );
}
