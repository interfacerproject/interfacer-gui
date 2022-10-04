import React, { ReactNode } from 'react';
import Topbar from "../Topbar";
import { useAuth } from "../../lib/auth";
import SignIn from "../../pages/sign_in";
import { useRouter } from 'next/router';
import Link from 'next/link';

type layoutProps = {
    children: ReactNode,
    cta?: ReactNode
}


const Layout: React.FunctionComponent<layoutProps> = (layoutProps: layoutProps) => {
    const { isSignedIn } = useAuth()

    return (
        <>
            <Topbar search={false} userMenu={false} cta={layoutProps.cta}>
                <div className="flex hidden w-auto p-4 mx-2 align-middle border-r md:block">
                    <Link href="/">
                        <div className="mx-auto logo" />
                    </Link>
                </div>
            </Topbar>
            <div className="container bg-[#F3F3F1] min-h-screen max-w-full">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <img src="https://www.interfacerproject.eu/assets/index/ABOUT.png"
                        className={'w-full h-full object-cover md:h-screen hidden md:block'} />
                    <div className="h-full">
                        {layoutProps?.children}
                    </div>
                </div>
            </div>
        </>

    )
}

export default Layout;
