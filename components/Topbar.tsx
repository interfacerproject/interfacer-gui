import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";
import LocationMenu from "./LocationMenu";
import NotificationBell from "./NotificationBell";

type topbarProps = {
  userMenu?: boolean;
  search?: boolean;
  children?: React.ReactNode;
  cta?: React.ReactNode;
};

function Topbar({ search = true, children, userMenu = true, cta }: topbarProps) {
  const router = useRouter();
  const path = router.asPath;
  const { t } = useTranslation("common");
  const isSignup = path === "/sign_up";
  const isSignin = path === "/sign_in";

  return (
    <div className="navbar bg-[#F3F3F1] px-2 pt-0 h-16 border-b border-text-primary">
      <div className="navbar-start">
        {children}
        {search && (
          <>
            <label htmlFor="my-drawer" className="btn btn-square btn-ghost drawer-button" data-test="sidebarOpener">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-5 h-5 stroke-current"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
            <input type="text" placeholder="search.." className="input rounded-xl input-bordered w-128" disabled />
          </>
        )}
      </div>
      <div className="navbar-end">
        {cta}
        {userMenu && <NotificationBell />}
        {(isSignup || isSignin) && (
          <div className="flex mr-2 space-x-2">
            <button className="btn btn-primary" onClick={() => router.push("/sign_in")}>
              {t("Login")}
            </button>
            <button className="btn btn-accent" onClick={() => router.push("/sign_up")}>
              {t("Sign up")}
            </button>
          </div>
        )}
        <LocationMenu />
      </div>
    </div>
  );
}

export default Topbar;
