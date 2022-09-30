import React, { ReactNode } from "react";
import Topbar from "./Topbar";
import { useAuth } from "../lib/auth";
import SignIn from "../pages/sign_in";
import { useRouter } from "next/router";
import { ArrowLeftIcon } from "@heroicons/react/outline";
import devLog from "../lib/devLog";

type layoutProps = {
    children: ReactNode;
    cta?: ReactNode;
};

const Layout: React.FunctionComponent<layoutProps> = (
    layoutProps: layoutProps
) => {
    const { isSignedIn } = useAuth();

    // Getting path
    const router = useRouter();
    const path = router.asPath;

    // Checking that we're on an authentication route
    const authentication =
        path === "/sign_out" ||
        path === "/sign_up" ||
        path === "/sign_in" ||
        (!isSignedIn() && path !== "/");

    return (
        <>
            {/* If we're in auth route */}
            {authentication && (
                <>
                    {/* If user is not signed in OR path is /sign_up, go with sign_up content */}
                    {(!isSignedIn || path === "/sign_up") &&
                        layoutProps?.children}
                    {/* If path is not /sign_up, then go with sign in */}
                    {path !== "/sign_up" && <SignIn />}
                </>
            )}
            {/* If we're not on an auth route, show contents */}
            {!authentication && (
                <>
                    <div className="drawer drawer-mobile">
                        <input
                            id="my-drawer"
                            type="checkbox"
                            className="drawer-toggle"
                        />
                        <div className="drawer-content">
                            {/* Topbar */}
                            <Topbar
                                search={false}
                                userMenu={false}
                                cta={layoutProps.cta}
                            >
                                <div className="w-auto h-16 p-4 border-r mx-2 hidden md:block">
                                    <div className="logo mx-auto" />
                                </div>
                                <button
                                    className="btn btn-primary btn-outline"
                                    onClick={() => router.back()}
                                >
                                    <ArrowLeftIcon className="w-5 h-5" />
                                    <p className="ml-2">Go back and discard</p>
                                </button>
                            </Topbar>

                            {/* Page contents */}
                            <div className="container bg-[#F3F3F1] min-h-screen max-w-full">
                                {layoutProps?.children}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default Layout;
