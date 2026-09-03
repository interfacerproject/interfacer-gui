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

/**
 * "One design. Many ways to make it real." — the four platform concepts.
 * DTEC prototype node 943:60964.
 */

import classNames from "classnames";
import { useTranslation } from "next-i18next";
import { HomeSectionHeading, headH2, headH4, homeGutter, textSm } from "./primitives";

export default function HomeConceptsSection() {
  const { t } = useTranslation("homeProps");

  const concepts = [
    {
      label: t("Designs"),
      headline: t("Start with open knowledge"),
      description: t("Files, documentation, materials and instructions that can be inspected, adapted and improved."),
    },
    {
      label: t("Services"),
      headline: t("Find what you need to make it"),
      description: t(
        "Discover machines, makerspaces, skills and manufacturing services that can turn a design into something physical."
      ),
    },
    {
      label: t("Products"),
      headline: t("See how a design becomes physical"),
      description: t(
        "A Product is a specific implementation of an open Design, connected to who made it and where it was manufactured."
      ),
    },
    {
      label: t("DPPs"),
      headline: t("Follow the product through its lifecycle"),
      description: t(
        "Connect a physical product to information about materials, provenance, compliance, repair and end-of-life."
      ),
    },
  ];

  return (
    <section className={classNames("flex w-full flex-col gap-10 bg-ifr-subdued py-14 md:gap-16 md:py-20", homeGutter)}>
      <HomeSectionHeading
        title={t("One design. Many ways to make it real.")}
        description={t(
          "Interfacer connects open designs with the people, tools, physical products and lifecycle data around them."
        )}
      />

      <div className="flex flex-wrap items-start gap-10">
        {concepts.map(concept => (
          <div key={concept.label} className="flex min-w-[300px] max-w-[320px] flex-1 flex-col gap-2">
            <h3 className={classNames(headH2, "text-ifr-green")}>{concept.label}</h3>
            <p className={classNames(headH4, "text-ifr-text-primary")}>{concept.headline}</p>
            <p className={classNames(textSm, "text-ifr-text-secondary")}>{concept.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
