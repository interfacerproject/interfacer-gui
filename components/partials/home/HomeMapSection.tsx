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

/** "Make it near you" — DTEC prototype node 943:60920. */

import classNames from "classnames";
import { useTranslation } from "next-i18next";
import dynamic from "next/dynamic";
import { HomeButton, headH1, homeGutter, textLg } from "./primitives";

// Mapbox touches `window` on import, so it can only load client-side.
const ProjectsMaps = dynamic(() => import("components/ProjectsMaps"), { ssr: false });

export default function HomeMapSection() {
  const { t } = useTranslation("homeProps");

  return (
    <section className="w-full bg-ifr-dark">
      <div className={classNames("flex flex-wrap items-center justify-between gap-8 py-14 md:py-20", homeGutter)}>
        <div className="flex flex-col gap-4">
          <h2 className={classNames(headH1, "text-ifr-text-inverse")}>{t("Make it near you")}</h2>
          <p className={classNames(textLg, "text-ifr-text-secondary")}>
            {t("Find makerspaces, machines and manufacturing services available around you.")}
          </p>
        </div>
        <HomeButton href="/services" size="lg">
          {t("Explore local services →")}
        </HomeButton>
      </div>

      <div className="w-full overflow-hidden">
        <ProjectsMaps bare height={480} />
      </div>
    </section>
  );
}
