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

import BrUserAvatar from "components/brickroom/BrUserAvatar";
import InterfacerLogo from "components/InterfacerLogo";
import NavigationMenu from "components/NavigationMenu";
import UserDropdown from "components/UserDropdown";
import { useAuth } from "hooks/useAuth";
import useInBox from "hooks/useInBox";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

type topbarProps = {
  userMenu?: boolean;
  search?: boolean;
  children?: React.ReactNode;
  cta?: React.ReactNode;
  burger?: boolean;
};

function Topbar({ search = true, userMenu = true, cta, burger = true }: topbarProps) {
  const router = useRouter();
  const path = router.asPath;
  const { user } = useAuth();
  const { t } = useTranslation("common");
  const { unread } = useInBox();
  const isSignup = path === "/sign_up";
  const isSignin = path === "/sign_in";

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close menu/dropdown on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setMenuOpen(false);
      setDropdownOpen(false);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router.events]);

  const [searchString, setSearchString] = useState("");
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && searchString.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchString.trim())}`);
      }
    },
    [searchString, router]
  );

  // Active nav link detection — exact catalog matching, no fallback
  const isDesigns = path === "/designs" || path.startsWith("/designs/");
  const isProducts = path === "/products" || path.startsWith("/products/");
  const isServices = path === "/services" || path.startsWith("/services/");

  return (
    <>
      <header
        className="flex items-center justify-between px-6 bg-[var(--ifr-bg-surface)] border-b border-[var(--ifr-border)] shrink-0 sticky top-0 z-50"
        style={{ height: "var(--ifr-topbar-height)", minHeight: "var(--ifr-topbar-height)" }}
      >
        {/* Left section: hamburger + logo + nav */}
        <div className="flex items-center gap-6">
          {/* Hamburger menu button */}
          {burger && (
            <button
              onClick={() => setMenuOpen(true)}
              className="flex flex-col items-start justify-center gap-[3px] bg-transparent border border-transparent cursor-pointer hover:border-[var(--ifr-border)] group transition-colors"
              style={{
                width: "var(--ifr-control-height)",
                height: "var(--ifr-control-height)",
                borderRadius: "var(--ifr-radius-sm)",
                padding: "0 10px",
              }}
              aria-label={t("Menu")}
            >
              <span
                className="block h-[2px] bg-[var(--ifr-text-secondary)] group-hover:bg-[var(--ifr-text-primary)] transition-colors"
                style={{ width: "16px", borderRadius: "1px" }}
              />
              <span
                className="block h-[2px] bg-[var(--ifr-text-secondary)] group-hover:bg-[var(--ifr-text-primary)] transition-colors"
                style={{ width: "11px", borderRadius: "1px" }}
              />
              <span
                className="block h-[2px] bg-[var(--ifr-text-secondary)] group-hover:bg-[var(--ifr-text-primary)] transition-colors"
                style={{ width: "6px", borderRadius: "1px" }}
              />
            </button>
          )}

          {/* Logo */}
          <Link href="/">
            <a className="flex items-center group">
              <InterfacerLogo className="h-5 w-auto" color="var(--ifr-text-secondary)" />
            </a>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-6 ml-2">
            <Link href="/designs">
              <a
                className={`no-underline whitespace-nowrap px-3 py-1.5 transition-colors ${
                  isDesigns
                    ? "bg-[var(--ifr-stat-green-bg)] text-[var(--ifr-green)]"
                    : "text-[var(--ifr-text-primary)] hover:bg-[var(--ifr-bg-hover)]"
                }`}
                style={{
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-base)",
                  fontWeight: "var(--ifr-fw-medium)",
                  borderRadius: "var(--ifr-radius-lg)",
                }}
              >
                {t("Designs")}
              </a>
            </Link>
            <Link href="/products">
              <a
                className={`no-underline whitespace-nowrap px-3 py-1.5 transition-colors ${
                  isProducts
                    ? "bg-[var(--ifr-type-product-bg)] text-[var(--ifr-type-product)]"
                    : "text-[var(--ifr-text-primary)] hover:bg-[var(--ifr-bg-hover)]"
                }`}
                style={{
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-base)",
                  fontWeight: "var(--ifr-fw-medium)",
                  borderRadius: "var(--ifr-radius-lg)",
                }}
              >
                {t("Products")}
              </a>
            </Link>
            <Link href="/services">
              <a
                className={`no-underline whitespace-nowrap px-3 py-1.5 transition-colors ${
                  isServices
                    ? "bg-[var(--ifr-type-service-bg)] text-[var(--ifr-type-service)]"
                    : "text-[var(--ifr-text-primary)] hover:bg-[var(--ifr-bg-hover)]"
                }`}
                style={{
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-base)",
                  fontWeight: "var(--ifr-fw-medium)",
                  borderRadius: "var(--ifr-radius-lg)",
                }}
              >
                {t("Services")}
              </a>
            </Link>
          </nav>
        </div>

        {/* Center: Search bar */}
        {search && (
          <div className="flex items-center flex-[0_1_400px] mx-4">
            <div className="flex items-center gap-2.5 flex-1 bg-[var(--ifr-bg-search)] border border-[var(--ifr-border)] rounded-full px-4 py-2 focus-within:border-[var(--ifr-text-secondary)] transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="block shrink-0">
                <path
                  d="M14.354 13.646L10.924 10.216C11.758 9.226 12.25 7.94 12.25 6.5C12.25 3.048 9.452 0.25 6 0.25C2.548 0.25 -0.25 3.048 -0.25 6.5C-0.25 9.952 2.548 12.75 6 12.75C7.44 12.75 8.726 12.258 9.716 11.424L13.146 14.854L14.354 13.646ZM1.25 6.5C1.25 3.878 3.378 1.75 6 1.75C8.622 1.75 10.75 3.878 10.75 6.5C10.75 9.122 8.622 11.25 6 11.25C3.378 11.25 1.25 9.122 1.25 6.5Z"
                  fill="var(--ifr-text-secondary)"
                />
              </svg>
              <input
                type="text"
                placeholder={t("Search designs, manufacturers, projects...")}
                className="flex-1 bg-transparent border-none outline-none text-[var(--ifr-text-primary)] placeholder:text-[var(--ifr-placeholder)]"
                style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)" }}
                value={searchString}
                onChange={e => setSearchString(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
            </div>
          </div>
        )}

        {/* Right section */}
        <div className="flex items-center gap-4">
          {cta}
          {/* Sign-in / Sign-up buttons for unauthenticated users */}
          {!user && !isSignin && !isSignup && (
            <div className="flex items-center gap-2">
              <button
                className="px-4 py-1.5 bg-transparent border border-[var(--ifr-border)] cursor-pointer transition-colors hover:bg-[var(--ifr-bg-hover)]"
                style={{
                  borderRadius: "var(--ifr-radius-sm)",
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-sm)",
                  fontWeight: "var(--ifr-fw-medium)",
                  color: "var(--ifr-text-primary)",
                }}
                onClick={() => router.push("/sign_in")}
              >
                {t("Sign in")}
              </button>
              <button
                className="px-4 py-1.5 border-none cursor-pointer transition-colors"
                style={{
                  borderRadius: "var(--ifr-radius-sm)",
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-sm)",
                  fontWeight: "var(--ifr-fw-medium)",
                  backgroundColor: "var(--ifr-green)",
                  color: "#fff",
                }}
                onClick={() => router.push("/sign_up")}
              >
                {t("Sign up")}
              </button>
            </div>
          )}
          {(isSignup || isSignin) && (
            <div className="flex space-x-2">
              <button className="btn btn-primary" onClick={() => router.push("/sign_in")}>
                {t("Login")}
              </button>
              <button className="btn btn-accent" onClick={() => router.push("/sign_up")}>
                {t("Sign up")}
              </button>
            </div>
          )}

          {/* User avatar with notification dot */}
          {user && userMenu && (
            <div className="relative flex items-center">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="relative rounded-full p-0 bg-transparent cursor-pointer overflow-visible hover:ring-2 hover:ring-[var(--ifr-text-secondary)]/30 transition-shadow"
                style={{
                  width: "var(--ifr-avatar-size)",
                  height: "var(--ifr-avatar-size)",
                  borderWidth: "0.2px",
                  borderStyle: "solid",
                  borderColor: "var(--ifr-border-avatar)",
                  boxShadow: "var(--ifr-shadow-avatar)",
                }}
              >
                <div className="w-full h-full rounded-full overflow-hidden">
                  <BrUserAvatar user={user} />
                </div>
                {/* Notification dot */}
                {Boolean(unread) && (
                  <div className="absolute top-[-2px] right-[-2px] w-[18px] h-[18px] rounded-full bg-[var(--ifr-yellow-bg)] border-[0.5px] border-[var(--ifr-border)] flex items-center justify-center">
                    <div className="w-[10px] h-[10px] rounded-full bg-[var(--ifr-yellow)]" />
                  </div>
                )}
              </button>

              {dropdownOpen && <UserDropdown onClose={() => setDropdownOpen(false)} />}
            </div>
          )}
        </div>
      </header>

      {/* Navigation drawer */}
      <NavigationMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

export default Topbar;
