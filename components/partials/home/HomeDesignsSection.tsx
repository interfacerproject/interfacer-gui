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

/** "Explore open designs" teaser row — DTEC prototype node 943:60906. */

import classNames from "classnames";
import { useResourceSpecs } from "hooks/useResourceSpecs";
import { useTranslation } from "next-i18next";
import HomeProjectsGrid from "./HomeProjectsGrid";
import { HomeButton, HomeSectionHeading, homeGutter } from "./primitives";

export default function HomeDesignsSection() {
  const { t } = useTranslation("homeProps");
  const { specProjectDesign } = useResourceSpecs();

  return (
    <section className="w-full bg-ifr-page">
      <div className={classNames("pt-12 pb-10 md:pt-16 md:pb-14", homeGutter)}>
        <HomeSectionHeading
          title={t("Explore open designs")}
          description={t("Open hardware documentation you can inspect, adapt and manufacture.")}
        />
      </div>

      <div className={homeGutter}>
        <HomeProjectsGrid
          conformsTo={specProjectDesign.id || undefined}
          count={4}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        />
      </div>

      <div className="flex justify-center pt-6 pb-20">
        <HomeButton href="/designs" size="lg">
          {t("Explore all designs →")}
        </HomeButton>
      </div>
    </section>
  );
}
