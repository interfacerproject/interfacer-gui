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

/** Homepage hero — DTEC prototype node 943:60818. */

import classNames from "classnames";
import { useTranslation } from "next-i18next";
import { useAuth } from "../../../hooks/useAuth";
import { HomeButton, headEpic, homeGutter, textLg, textSm } from "./primitives";

/** Consortium logos, in the prototype's order. */
const consortiumPartners = [
  { src: "/partners/helmut-schmidt.svg", alt: "Helmut Schmidt University", className: "h-[74px] w-[112px]" },
  { src: "/partners/fab-city.svg", alt: "Fab City", className: "h-[74px] w-[151px]" },
  { src: "/partners/hiww.svg", alt: "Hamburg Institute of World Wide Web", className: "h-[74px] w-[114px]" },
  { src: "/partners/dyne.svg", alt: "Dyne.org", className: "h-[74px] w-[77px]" },
];

export default function HomeHero() {
  const { t } = useTranslation("homeProps");
  const { authenticated } = useAuth();

  return (
    <section className="w-full bg-ifr-page">
      <div className={classNames("flex flex-col gap-4 pt-16 pb-10 md:pt-[120px] md:pb-20", homeGutter)}>
        <h1 className={classNames(headEpic, "text-ifr-text-primary")}>
          {t("Open hardware")}
          <br />
          {t("from files to fabrication")}
        </h1>
        <p className={classNames(textLg, "max-w-[801px] text-ifr-text-secondary")}>
          {t(
            "Explore open designs, find products and local manufacturing resources, or publish your own work. Interfacer connects open knowledge with the people, tools and places that can make it real."
          )}
        </p>
      </div>

      <div className={classNames("flex flex-wrap items-start justify-between gap-10 pb-12 md:pb-16", homeGutter)}>
        <div className="flex flex-wrap items-center gap-3">
          <HomeButton href="/designs">{t("Explore Designs")}</HomeButton>
          {!authenticated && (
            <HomeButton href="/sign_up" variant="secondary">
              {t("Join Interfacer — free")}
            </HomeButton>
          )}
          {authenticated && (
            <HomeButton href="/create/project" variant="secondary">
              {t("Create a new project")}
            </HomeButton>
          )}
        </div>

        <div className="flex w-full flex-col gap-4 lg:w-[526px]">
          <p className="text-[16px] font-semibold leading-[24px] text-ifr-text-secondary lg:text-right">
            {t("Built with open-hardware researchers and communities across Europe")}
          </p>
          <div className="flex flex-col items-start gap-2 lg:items-end">
            <div className="flex flex-wrap items-center gap-6 lg:justify-end">
              {consortiumPartners.map(partner => (
                <img
                  key={partner.src}
                  src={partner.src}
                  alt={partner.alt}
                  className={classNames("object-contain", partner.className)}
                />
              ))}
            </div>
            <span className={classNames(textSm, "border-b border-ifr text-ifr-text-muted")}>
              {t("Consortium Partners")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
