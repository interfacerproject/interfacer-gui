import React, {ReactNode} from 'react';
import Topbar from "./Topbar";
import {useAuth} from "../lib/auth";
import SignIn from "../pages/sign_in";

type layoutProps = {
    children: ReactNode,
    cta?: ReactNode
}


const Layout: React.FunctionComponent<layoutProps> = (layoutProps: layoutProps) => {
    const {isSignedIn} = useAuth()

    return (
        <>
            <Topbar search={false} userMenu={false} cta={layoutProps.cta}>
                <div className="w-auto h-16 p-4 border-r mx-2 hidden md:block">
                    <div className="logo mx-auto"/>
                </div>
            </Topbar>
            <div className="container bg-[#F3F3F1] min-h-screen max-w-full">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <img src="https://www.interfacerproject.eu/assets/index/ABOUT.png"
                         className={'w-full h-full object-cover md:h-screen hidden md:block'}/>
                    <div className="h-full">
                        {layoutProps?.children}
                    </div>
                </div>
            </div>
        </>

    )
}

export default Layout;
