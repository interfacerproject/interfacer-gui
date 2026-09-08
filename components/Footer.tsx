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

import InterfacerLogo from "components/InterfacerLogo";
import { useTranslation } from "next-i18next";
import NextLink from "next/link";
import React, { ReactNode } from "react";

const PRIVACY_POLICY_URL = "https://www.iubenda.com/privacy-policy/75616407";

const linkClass =
  "no-underline text-[var(--ifr-text-primary)] hover:text-[var(--ifr-green)] transition-colors leading-6";

const linkStyle: React.CSSProperties = {
  fontFamily: "var(--ifr-font-body)",
  fontSize: "var(--ifr-fs-base)",
  fontWeight: "var(--ifr-fw-regular)",
};

/* Column heading — uppercase, green, letter-spaced */
const ColumnTitle = ({ children }: { children: ReactNode }) => (
  <h3
    className="text-[var(--ifr-green)] m-0"
    style={{
      fontFamily: "var(--ifr-font-body)",
      fontSize: "var(--ifr-fs-sm)",
      fontWeight: "var(--ifr-fw-semibold)",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
    }}
  >
    {children}
  </h3>
);

const InternalLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <NextLink href={href}>
    <a className={linkClass} style={linkStyle}>
      {children}
    </a>
  </NextLink>
);

const ExternalLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a className={linkClass} style={linkStyle} href={href} target="_blank" rel="noreferrer">
    {children}
    <span aria-hidden="true" className="ml-1 text-[var(--ifr-text-secondary)]">
      {"↗"}
    </span>
  </a>
);

const Footer = () => {
  const { t } = useTranslation("common");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--ifr-bg-surface)] border-t border-[var(--ifr-border)]">
      {/* --- Brand + link columns --- */}
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col md:flex-row py-10 md:py-12">
          {/* Brand */}
          <div className="md:w-[300px] shrink-0 pb-8 md:pb-0 md:pr-12 md:border-r md:border-[var(--ifr-border)]">
            <NextLink href="/">
              <a className="inline-block">
                <InterfacerLogo className="h-5 w-auto" color="var(--ifr-green)" />
              </a>
            </NextLink>
            <p
              className="mt-4 mb-0 text-[var(--ifr-text-secondary)] max-w-[220px]"
              style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)", lineHeight: "20px" }}
            >
              {t("Open hardware from files to fabrication.")}
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-[max-content_max-content_1fr] gap-x-8 md:gap-x-16 gap-y-10 flex-1 pt-8 md:pt-0 md:pl-12 border-t md:border-t-0 border-[var(--ifr-border)]">
            <div className="flex flex-col gap-3">
              <ColumnTitle>{t("Explore")}</ColumnTitle>
              <InternalLink href="/designs">{t("Designs")}</InternalLink>
              <InternalLink href="/products">{t("Products")}</InternalLink>
              <InternalLink href="/services">{t("Services")}</InternalLink>
            </div>

            <div className="flex flex-col gap-3">
              <ColumnTitle>{t("Contribute")}</ColumnTitle>
              <InternalLink href="/create/project/design">{t("Publish a design")}</InternalLink>
              <InternalLink href="/create/project/product">{t("Publish a product")}</InternalLink>
              <InternalLink href="/create/project/service">{t("Offer your capabilities")}</InternalLink>
            </div>

            <div className="flex flex-col gap-3 col-span-2 md:col-span-1">
              <ColumnTitle>{"Interfacer"}</ColumnTitle>
              <ExternalLink href="https://www.interfacerproject.eu/">{t("About the project")}</ExternalLink>
              <ExternalLink href="https://interfacerproject.github.io/interfacer-docs/">
                {t("Documentation")}
              </ExternalLink>
              <ExternalLink href="https://github.com/interfacerproject">{"GitHub"}</ExternalLink>
              <ExternalLink href="https://github.com/dyne/interfacer-gui/issues/new">
                {t("Report an issue")}
              </ExternalLink>
            </div>
          </div>
        </div>
      </div>

      {/* --- Funders --- */}
      <div className="border-t border-[var(--ifr-border)]">
        <div className="max-w-[1280px] mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center">
            <span
              className="text-[var(--ifr-text-secondary)] shrink-0 pb-5 md:pb-0 md:pr-10 md:border-r md:border-[var(--ifr-border)]"
              style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
            >
              {t("Funded by")}
            </span>
            <div className="flex flex-col items-start md:flex-row md:items-center gap-6 md:gap-10 md:pl-10">
              <img
                className="h-[42px] w-auto"
                src="/logo-bwi.svg"
                alt="Behörde für Wirtschaft und Innovation Hamburg"
              />
              <img className="h-[42px] w-auto" src="/logo-eu.svg" alt="Europäische Union" />
              <img className="h-[42px] w-auto" src="/logo-dtec.svg" alt="dtec.bw" />
            </div>
          </div>
        </div>
      </div>

      {/* --- Legal bar --- */}
      <div className="border-t border-[var(--ifr-border)] bg-[var(--ifr-bg-hover-light)]">
        <div
          className="max-w-[1280px] mx-auto px-6 py-3 flex flex-wrap items-center gap-x-3 gap-y-1 sm:justify-between text-[var(--ifr-text-secondary)]"
          style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
        >
          <span>
            {t("Open-source software by")}{" "}
            <a
              className="no-underline text-[var(--ifr-text-secondary)] hover:text-[var(--ifr-green)] transition-colors"
              href="https://dyne.org"
              target="_blank"
              rel="noreferrer"
            >
              {"Dyne.org"}
            </a>
            {` · © ${year} Interfacer`}
          </span>
          <a
            className="no-underline text-[var(--ifr-text-secondary)] hover:text-[var(--ifr-green)] transition-colors"
            href={PRIVACY_POLICY_URL}
            target="_blank"
            rel="noreferrer"
          >
            {t("Privacy policy")}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
