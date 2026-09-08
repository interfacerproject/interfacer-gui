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

/** "Open by design" — the open-source CTA. DTEC prototype node 1050:25581. */

import classNames from "classnames";
import { useTranslation } from "next-i18next";
import { useAuth } from "../../../hooks/useAuth";
import { HomeButton, headH3, headH4, homeGutter, textLg, textSm } from "./primitives";

const REPO_URL = "https://github.com/dyne/interfacer-gui";
const NEW_ISSUE_URL = `${REPO_URL}/issues/new`;

export default function HomeOpenSourceSection() {
  const { t } = useTranslation("homeProps");
  const { authenticated } = useAuth();

  return (
    <section className="w-full bg-ifr-dark">
      <div className="flex flex-wrap items-center justify-center">
        <div
          className={classNames(
            "flex min-w-[min(100%,320px)] flex-1 flex-col justify-center gap-6 py-14 md:py-20",
            homeGutter
          )}
        >
          <p className="font-display text-[22px] font-medium uppercase leading-[30px] text-ifr-yellow">
            {t("Open by design")}
          </p>
          <div className="flex flex-col gap-2 text-ifr-text-inverse">
            <h2 className={headH3}>{t("Interfacer is free and open source.")}</h2>
            <p className={textLg}>
              {t("Inspect the code, report issues, contribute improvements — or add your own work to the network.")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <HomeButton href={REPO_URL} size="lg">
              {t("View on Github")}
            </HomeButton>
            {!authenticated && (
              <HomeButton href="/sign_up" variant="onDark" size="lg">
                {t("Join Interfacer — free")}
              </HomeButton>
            )}
          </div>
        </div>

        <div className="flex w-full shrink-0 items-center justify-center px-6 pb-14 md:px-10 lg:w-[520px] lg:px-0 lg:py-16">
          <div className="flex w-full max-w-[390px] flex-col gap-6 rounded-[10px] bg-white p-[22px]">
            <div className="flex flex-col gap-2">
              <h3 className={classNames(headH4, "text-ifr-text-primary")}>{t("Report an issue on Github")}</h3>
              <p className={classNames(textSm, "text-ifr-text-secondary")}>
                {t("Found a bug or have an idea to improve the platform? Open an issue and help us improve the code.")}
              </p>
            </div>
            <a
              href={NEW_ISSUE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-[7px] bg-ifr-yellow px-[17px] text-[13px] font-medium text-ifr-text-primary no-underline transition-colors hover:bg-ifr-yellow-hover"
            >
              {t("Create an issue")}
            </a>
          </div>
        </div>
      </div>

      {/* The prototype's capsule pattern strip, then a solid band below it. */}
      <div
        aria-hidden
        className="h-[84px] w-full bg-repeat-x"
        style={{ backgroundImage: "url(/pattern-border.svg)", backgroundSize: "auto 84px" }}
      />
      <div aria-hidden className="h-10 w-full" />
    </section>
  );
}
