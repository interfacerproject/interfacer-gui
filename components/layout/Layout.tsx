import React, { ReactNode, useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import { useAuth } from "../../lib/auth";
import SignIn from "../../pages/sign_in";
import { useRouter } from "next/router";

type layoutProps = {
    children: ReactNode;
};

const Layout: React.FunctionComponent<layoutProps> = (
    layoutProps: layoutProps
) => {
    const { isSignedIn } = useAuth();
    const [isSignUp, setSignUp] = useState(false);
    const [isSignOut, setSignOut] = useState(false);
    const [isSignIn, setSignIn] = useState(false);
    const [authentication, setAuthentication] = useState(false);

    const router = useRouter();

    // Closes sidebar automatically when route changes
    useEffect(() => {
        const path = router.asPath;
        setSignUp(path === "/sign_up");
        setSignIn(path === "/sign_in");
        setSignOut(path === "/sign_out");
        setAuthentication(isSignOut || isSignUp || isSignIn || (!isSignedIn() && path !== "/"));
        router.events.on("routeChangeComplete", () => {
            let drawer = document.getElementById("my-drawer");
            if (drawer) {
                (drawer as HTMLInputElement).checked = false;
            }
        });
    }, [ isSignedIn ]);

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
                            <input
                                id="my-drawer"
                                type="checkbox"
                                className="drawer-toggle"
                            />
                            <div className="drawer-content">
                                <Topbar />
                                <div className="bg-[#F3F3F1] min-h-screen max-w-full">
                                    {layoutProps?.children}
                                </div>
                            </div>
                            <div className="drawer-side">
                                <label
                                    htmlFor="my-drawer"
                                    className="drawer-overlay"
                                />
                                <Sidebar />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#F3F3F1] min-h-screen">
                            {layoutProps?.children}
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default Layout;
