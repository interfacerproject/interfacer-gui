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
 * The three entry paths into the platform, plus the three contribution
 * prompts underneath — DTEC prototype node 943:60847.
 */

import classNames from "classnames";
import { categoryVisuals } from "components/partials/create/FormControls";
import { useTranslation } from "next-i18next";
import { ReactNode } from "react";
import { HomeButton, HomeTextLink, headH2, headH3, headH4, homeGutter, textBase, textSm } from "./primitives";

/** The prototype's dark-to-transparent wash over each card image. */
const imageOverlay = "linear-gradient(65deg, rgba(0,0,0,0.6) 5%, rgba(0,0,0,0) 95%)";

function CardImage(props: { src: string; className?: string }) {
  return (
    <div className={classNames("relative shrink-0 overflow-hidden", props.className)}>
      <img src={props.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div aria-hidden className="absolute inset-0" style={{ backgroundImage: imageOverlay }} />
    </div>
  );
}

/** The four sample categories the prototype shows, plus a "+3" overflow pill. */
const featuredCategories = ["Electronics", "Tools", "Home", "Energy"];
const hiddenCategoriesCount = 3;

function CategoryChips() {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-wrap items-center gap-2">
      {featuredCategories.map(category => {
        const { Icon } = categoryVisuals[category];
        return (
          <span
            key={category}
            className="flex items-center gap-1.5 rounded-ifr-sm border border-ifr bg-ifr-quote py-[9px] pl-[9px] pr-[13px]"
          >
            <span
              aria-hidden
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-ifr-md bg-ifr-subdued text-ifr-text-secondary"
            >
              <Icon size={16} />
            </span>
            <span className="text-[12px] font-medium leading-[18px] text-ifr-text-primary">{t(category)}</span>
          </span>
        );
      })}
      <span className="flex items-center rounded-ifr-full border border-ifr bg-ifr-quote px-3 py-1.5 text-[12px] font-medium leading-[18px] text-ifr-text-secondary">
        {`+${hiddenCategoriesCount}`}
      </span>
    </div>
  );
}

/** One of the two side-by-side pathway cards; `reversed` puts the image first. */
function SplitPathwayCard(props: {
  image: string;
  title: string;
  description: string;
  action: ReactNode;
  link: ReactNode;
  reversed?: boolean;
}) {
  const { image, title, description, action, link, reversed = false } = props;

  return (
    <div
      className={classNames(
        "flex overflow-hidden rounded-ifr-sm bg-ifr-subdued max-sm:flex-col",
        reversed ? "sm:flex-row-reverse" : "sm:flex-row"
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2 px-5 py-6">
        <h3 className={classNames(headH3, "text-ifr-text-primary")}>{title}</h3>
        <p className={classNames(textBase, "text-ifr-text-primary")}>{description}</p>
        <div className="mt-2 flex flex-col items-start gap-4">
          {action}
          {link}
        </div>
      </div>
      <CardImage src={image} className="max-sm:h-[180px] max-sm:w-full sm:w-[231px]" />
    </div>
  );
}

/** One of the three "give something back" prompts. */
function ContributionCard(props: { title: string; description: string; href: string; linkLabel: string }) {
  const { title, description, href, linkLabel } = props;
  return (
    <div className="flex min-w-[280px] max-w-[480px] flex-1 flex-col gap-3 rounded-ifr-sm bg-ifr-subdued p-5">
      <div className="flex flex-col gap-1 text-ifr-text-primary">
        <h3 className={headH4}>{title}</h3>
        <p className={textSm}>{description}</p>
      </div>
      <HomeTextLink href={href} underline={false}>
        {linkLabel}
      </HomeTextLink>
    </div>
  );
}

export default function HomePathwaysSection() {
  const { t } = useTranslation("homeProps");

  return (
    <section className="w-full bg-ifr-dark py-14 md:py-20">
      <div className={classNames("flex flex-col gap-6", homeGutter)}>
        <div className="flex flex-wrap items-stretch gap-6">
          {/* Designs — the wide card, image on top. */}
          <div className="flex min-w-[min(100%,420px)] flex-1 flex-col overflow-hidden rounded-ifr-sm bg-ifr-subdued">
            <CardImage src="/home/build-or-adapt.jpg" className="h-[235px] w-full" />
            <div className="flex flex-col gap-6 px-5 pt-6 pb-8">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 text-ifr-text-primary">
                  <h3 className={headH2}>{t("Build or adapt something")}</h3>
                  <p className={textBase}>{t("Browse open designs you can build, modify and improve.")}</p>
                </div>
                <CategoryChips />
              </div>
              <HomeButton href="/designs" className="self-start">
                {t("Explore all designs")}
              </HomeButton>
            </div>
          </div>

          {/* Products and services — the two stacked cards. */}
          <div className="flex min-w-[min(100%,420px)] flex-1 flex-col justify-center gap-6">
            <SplitPathwayCard
              image="/home/get-a-product.jpg"
              title={t("Get a physical product")}
              description={t("Find an existing product or someone who can manufacture it for you.")}
              action={<HomeButton href="/products">{t("Explore products")}</HomeButton>}
              link={<HomeTextLink href="/services">{t("Find manufacturing services →")}</HomeTextLink>}
            />
            <SplitPathwayCard
              reversed
              image="/home/find-tools.jpg"
              title={t("Find tools, skills or a place to make")}
              description={t("Discover local capabilities that can help you build, manufacture or repair something.")}
              action={<HomeButton href="/services">{t("Explore services")}</HomeButton>}
              link={<HomeTextLink href="/resources">{t("Find resources near me →")}</HomeTextLink>}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-center gap-6">
          <ContributionCard
            title={t("Publish a design")}
            description={t("Share documentation others can build and improve.")}
            href="/create/project/design"
            linkLabel={t("Publish a design →")}
          />
          <ContributionCard
            title={t("Publish a product")}
            description={t("Share a product you've manufactured from an open design.")}
            href="/create/project/product"
            linkLabel={t("Publish a product →")}
          />
          <ContributionCard
            title={t("Offer your capabilities")}
            description={t("Make your services, machines or facilities discoverable.")}
            href="/create/project/service"
            linkLabel={t("Add services & equipment →")}
          />
        </div>
      </div>
    </section>
  );
}
