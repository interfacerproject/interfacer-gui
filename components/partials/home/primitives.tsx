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
 * Shared building blocks for the homepage.
 *
 * Reference: DTEC prototype, homepage frames
 *   1920 https://www.figma.com/design/fZm62oTpY4srzipfiBQ1vR?node-id=943-60815
 *   1400 …node-id=943-62082 · 1080 …node-id=943-63406 · 780 …node-id=943-64673
 *
 * The prototype uses an 80px page gutter at 1920 that collapses on narrower
 * frames; `homeGutter` is that gutter, shared by every section so the sections
 * stay aligned with one another at every width.
 */

import classNames from "classnames";
import Link from "next/link";
import { ReactNode } from "react";

/** Page gutter: 24px on phones, 40px on tablets, the prototype's 80px from xl. */
export const homeGutter = "px-6 md:px-10 xl:px-20";

/** Head/Epic — 72/80 at 1920, stepped down for narrower frames. */
export const headEpic =
  "font-display font-bold text-[36px] leading-[44px] md:text-[56px] md:leading-[64px] xl:text-[72px] xl:leading-[80px]";
/** Head/H1 — 48/56 at 1920. */
export const headH1 =
  "font-display font-bold text-[30px] leading-[38px] md:text-[38px] md:leading-[46px] xl:text-[48px] xl:leading-[56px]";
/** Head/H2 — 36/44. */
export const headH2 = "font-display font-bold text-[28px] leading-[36px] md:text-[36px] md:leading-[44px]";
/** Head/H3 — 28/36. */
export const headH3 = "font-display font-bold text-[24px] leading-[32px] md:text-[28px] md:leading-[36px]";
/** Head/H4 — 22/30. */
export const headH4 = "font-display font-bold text-[22px] leading-[30px]";
/** Text/lg — 18/27. */
export const textLg = "text-[16px] leading-[24px] md:text-[18px] md:leading-[27px]";
/** Text/base/400 — 16/24. */
export const textBase = "text-[16px] leading-[24px]";
/** Text/sm/400 — 14/21. */
export const textSm = "text-[14px] leading-[21px]";

type ButtonSize = "md" | "lg";

const buttonSize: Record<ButtonSize, string> = {
  // Text/sm/600 in a 24/12 box — the hero and in-card actions.
  md: "px-6 py-3 text-[14px] leading-[21px]",
  // Text/base/600 in a 28/14 box — the standalone section actions.
  lg: "px-7 py-3.5 text-[16px] leading-[24px]",
};

export interface HomeButtonProps {
  href: string;
  children: ReactNode;
  /** Yellow by default; `secondary` is the bordered white variant. */
  variant?: "primary" | "secondary" | "onDark";
  size?: ButtonSize;
  className?: string;
}

/**
 * The prototype's flat rounded action. Rendered as a link because every
 * homepage action navigates.
 */
export function HomeButton(props: HomeButtonProps) {
  const { href, children, variant = "primary", size = "md", className } = props;

  return (
    <Link href={href}>
      <a
        className={classNames(
          "inline-flex items-center justify-center whitespace-nowrap rounded-ifr-md font-semibold no-underline transition-colors",
          buttonSize[size],
          {
            "bg-ifr-yellow text-ifr-text-primary hover:bg-ifr-yellow-hover": variant === "primary",
            "border border-ifr bg-ifr-surface text-ifr-text-primary hover:bg-ifr-hover": variant === "secondary",
            "border border-white bg-ifr-surface text-ifr-text-primary hover:bg-ifr-hover": variant === "onDark",
          },
          className
        )}
      >
        {children}
      </a>
    </Link>
  );
}

/** Underlined green link used under the pathway cards. */
export function HomeTextLink(props: { href: string; children: ReactNode; underline?: boolean }) {
  const { href, children, underline = true } = props;
  return (
    <Link href={href}>
      <a
        className={classNames(
          "font-semibold text-ifr-green hover:text-ifr-green-hover",
          textSm,
          underline ? "underline" : "no-underline"
        )}
      >
        {children}
      </a>
    </Link>
  );
}

/**
 * Section heading: an H1 with a Text/lg subtitle underneath. `onDark` flips the
 * title to white for the sections that sit on `--ifr-bg-dark`.
 */
export function HomeSectionHeading(props: {
  title: string;
  description: string;
  onDark?: boolean;
  className?: string;
}) {
  const { title, description, onDark = false, className } = props;
  return (
    <div className={classNames("flex flex-col gap-2", className)}>
      <h2 className={classNames(headH1, onDark ? "text-ifr-text-inverse" : "text-ifr-text-primary")}>{title}</h2>
      <p className={classNames(textLg, "text-ifr-text-secondary")}>{description}</p>
    </div>
  );
}
