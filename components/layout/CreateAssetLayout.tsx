import { ArrowLeftIcon } from "@heroicons/react/outline";
import { useRouter } from 'next/router';
import React, { ReactNode } from 'react';
import Topbar from "../Topbar";

type layoutProps = {
    children: ReactNode;
    cta?: ReactNode;
};

const Layout: React.FunctionComponent<layoutProps> = (
    layoutProps: layoutProps
) => {
    const router = useRouter();

    return (
        <>
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
                            <div className="hidden w-auto h-16 p-4 mx-2 border-r md:block">
                                <div className="mx-auto logo" />
                            </div>
                            <button
                                className="btn btn-primary btn-outline"
                                data-test="back"
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
        </>
    );
};

export default Layout;
