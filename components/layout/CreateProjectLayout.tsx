import React, {ReactNode} from 'react';
import Topbar from "../Topbar";
import {useAuth} from "../../lib/auth";
import SignIn from "../../pages/sign_in";
import {useRouter} from 'next/router'
import {ArrowLeftIcon} from "@heroicons/react/outline";

type layoutProps = {
    children: ReactNode,
    cta?: ReactNode
}


const Layout: React.FunctionComponent<layoutProps> = (layoutProps: layoutProps) => {
    const {isSignedIn} = useAuth()
    const router = useRouter()
    const path = router.asPath
    const authentication = path === '/sign_out' || path === '/sign_up' || path === '/sign_in' || !isSignedIn() && path !== '/'

    return (
        <>
            {authentication && <>
                {(!isSignedIn || path === '/sign_up') && layoutProps?.children}
                {path !== '/sign_up' && <SignIn/>}
            </>}
            {!authentication && <>
                <div className="drawer drawer-mobile">
                    <input id="my-drawer" type="checkbox" className="drawer-toggle"/>
                    <div className="drawer-content">
                         <Topbar search={false} userMenu={false} cta={layoutProps.cta}>
                            <div className="w-auto h-16 p-4 border-r mx-2 hidden md:block">
                                <div className="logo mx-auto"/>
                            </div>
                            <button className="btn btn-accent btn-outline" onClick={() => router.back()}>
                                <ArrowLeftIcon className="w-5 h-5"/> Go back and discard
                            </button>
                        </Topbar>
                        <div className="container bg-[#F3F3F1] min-h-screen max-w-full">
                            {layoutProps?.children}
                        </div>
                    </div>
                </div>
            </>}
        </>

    )
}

export default Layout;
