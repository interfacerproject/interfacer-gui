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
 * Shared building blocks for the sign-in and sign-up screens.
 *
 * Reference: DTEC prototype, authentication frames
 *   step 1 — account identification
 *     https://www.figma.com/design/fZm62oTpY4srzipfiBQ1vR?node-id=1092-11140
 *   step 2 — choose sign in method  …node-id=1092-14648
 *   step 3A — passphrase            …node-id=1092-14277
 *
 * The prototype puts every step of the flow in one 500px card centred on the
 * page background: a header (optional back link, H3, description), the fields,
 * then a stack of actions. The steps the prototype does not draw — the recovery
 * questions, the passphrase reveal and the whole sign-up flow — are built from
 * the same pieces so the two flows stay of a piece.
 */

import classNames from "classnames";
import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * The band the card sits in. The prototype gives it a fixed 800px height
 * between the topbar and the footer; on phones it collapses to its content.
 */
export function AuthPage(props: { children: ReactNode }) {
  return (
    <section className="flex w-full items-center justify-center bg-ifr-page px-4 py-10 md:min-h-[800px] md:py-20">
      <div className="w-full max-w-[500px]">{props.children}</div>
    </section>
  );
}

/** The white card: 40px padding and a 24px rhythm between its blocks. */
export function AuthCard(props: { children: ReactNode; className?: string }) {
  return (
    <div
      className={classNames(
        "flex w-full flex-col gap-6 rounded-ifr-md border border-ifr bg-ifr-surface p-6 md:p-10",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}

/**
 * Header block: Head/H3 over a Text/base description, with room above for the
 * back link on the steps that have one.
 */
export function AuthCardHeader(props: { title: string; description?: ReactNode; back?: ReactNode }) {
  const { title, description, back } = props;
  return (
    <div className="flex flex-col gap-2">
      {back}
      <h1 className="font-display text-[28px] font-bold leading-[36px] text-ifr-text-primary">{title}</h1>
      {description && <p className="text-[16px] leading-[24px] text-ifr-text-secondary">{description}</p>}
    </div>
  );
}

const backLinkClass =
  "self-start bg-transparent p-0 text-left text-[14px] leading-[21px] text-ifr-text-muted no-underline transition-colors hover:text-ifr-text-primary";

/** "← Back to sign in". Navigates when given an `href`, otherwise it is a step reset. */
export function AuthBackLink(props: { label: string; href?: string; onClick?: () => void }) {
  const { label, href, onClick } = props;

  if (href) {
    return (
      <Link href={href}>
        <a className={backLinkClass}>{`← ${label}`}</a>
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={backLinkClass}>
      {`← ${label}`}
    </button>
  );
}

/** The 16px stack of actions at the foot of the card. */
export function AuthActions(props: { children: ReactNode; className?: string }) {
  return <div className={classNames("flex flex-col gap-4", props.className)}>{props.children}</div>;
}

export interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Green by default; `secondary` is the bordered white variant. */
  variant?: "primary" | "secondary";
}

/** The prototype's 44px full-width action. */
export function AuthButton(props: AuthButtonProps) {
  const { variant = "primary", className, type = "button", ...rest } = props;
  return (
    <button
      {...rest}
      type={type}
      className={classNames(
        "flex h-11 w-full items-center justify-center rounded-ifr-md text-[14px] font-semibold leading-[21px] transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        {
          "bg-ifr-green text-white hover:bg-ifr-green-hover": variant === "primary",
          "border border-ifr bg-ifr-surface text-ifr-text-primary hover:bg-ifr-hover": variant === "secondary",
        },
        className
      )}
    />
  );
}

const arrowLinkClass =
  "self-start bg-transparent p-0 text-left text-[14px] font-medium leading-[21px] text-ifr-green no-underline transition-colors hover:text-ifr-green-hover";

/** Green "Create an account →" style link. Navigates or switches step. */
export function AuthArrowLink(props: { label: string; href?: string; onClick?: () => void; id?: string }) {
  const { label, href, onClick, id } = props;

  if (href) {
    return (
      <Link href={href}>
        <a id={id} className={arrowLinkClass}>{`${label} →`}</a>
      </Link>
    );
  }

  return (
    <button type="button" id={id} onClick={onClick} className={arrowLinkClass}>
      {`${label} →`}
    </button>
  );
}

/** The "New to Interfacer? / Create an account →" pair under the primary action. */
export function AuthSuggestion(props: { baseText: string; linkText: string; url?: string; onClick?: () => void }) {
  const { baseText, linkText, url, onClick } = props;
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[14px] leading-[21px] text-ifr-text-muted">{baseText}</p>
      <AuthArrowLink label={linkText} href={url} onClick={onClick} />
    </div>
  );
}

/** Inline error inside the card, in the prototype's red rather than Tailwind's. */
export function AuthError(props: { children: ReactNode; testID?: string }) {
  return (
    <div
      data-test={props.testID}
      className="rounded-ifr-md border border-[color:var(--ifr-red)] bg-ifr-red-hover-bg px-4 py-3 text-[14px] leading-[21px] text-ifr-red"
    >
      {props.children}
    </div>
  );
}
