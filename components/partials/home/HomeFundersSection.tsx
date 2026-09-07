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

/** "Funded by:" — DTEC prototype node 943:61155. */

import classNames from "classnames";
import { useTranslation } from "next-i18next";
import { headH3, homeGutter } from "./primitives";

const funders = [
  { src: "/partners/hamburg.svg", alt: "Freie und Hansestadt Hamburg" },
  { src: "/partners/eu.svg", alt: "Europäische Union — Europäischer Fonds für regionale Entwicklung" },
];

export default function HomeFundersSection() {
  const { t } = useTranslation("homeProps");

  return (
    <section className={classNames("w-full bg-ifr-page pt-8 pb-8", homeGutter)}>
      <h2 className={classNames(headH3, "text-ifr-text-primary")}>{t("Funded by:")}</h2>
      <div className="flex flex-wrap items-center gap-6 pt-5">
        {funders.map(funder => (
          <div key={funder.src} className="flex h-[124px] min-w-[280px] flex-1 items-center justify-center">
            <img src={funder.src} alt={funder.alt} className="h-[76px] w-full max-w-[342px] object-contain" />
          </div>
        ))}
      </div>
    </section>
  );
}
