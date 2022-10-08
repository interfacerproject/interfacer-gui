import React, { ReactNode, useEffect } from "react";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import { useAuth } from "../../lib/auth";
import SignIn from "../../pages/sign_in";
import { useRouter } from "next/router";

type layoutProps = {
  children: ReactNode;
};

const Layout: React.FunctionComponent<layoutProps> = (layoutProps: layoutProps) => {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const path = router.asPath;
  const isSignUp = path === "/sign_up";
  const isSignIn = path === "/sign_in";
  const isSignOut = path === "/sign_out";
  const authentication = isSignOut || isSignUp || isSignIn || (!isSignedIn() && path !== "/");

  // Closes sidebar automatically when route changes
  useEffect(() => {
    router.events.on("routeChangeComplete", () => {
      const drawer = document.getElementById("my-drawer");
      if (drawer) {
        (drawer as HTMLInputElement).checked = false;
      }
    });
  });

  return (
    <>
      {authentication && (
        <>
          {(!isSignedIn || isSignUp) && layoutProps?.children}
          {!isSignUp && <SignIn />}
        </>
      )}
      {!authentication && (
        <>
          {isSignedIn() ? (
            <div className="drawer">
              <input id="my-drawer" type="checkbox" className="drawer-toggle" />
              <div className="drawer-content">
                <Topbar />
                <div className="bg-[#F3F3F1] min-h-screen max-w-full">{layoutProps?.children}</div>
              </div>
              <div className="drawer-side">
                <label htmlFor="my-drawer" className="drawer-overlay" />
                <Sidebar />
              </div>
            </div>
          ) : (
            <div className="bg-[#F3F3F1] min-h-screen">{layoutProps?.children}</div>
          )}
        </>
      )}
    </>
  );
};

export default Layout;
