import React, {ReactNode} from 'react';
import Sidebar from "./sidebar"
import Topbar from "./topbar";
import {useAuth} from "../lib/auth";
import SignIn from "../pages/sign_in";
import {useRouter} from 'next/router'


type layoutProps = {
    children: ReactNode
}


const Layout:React.FunctionComponent<layoutProps> = (layoutProps:layoutProps) => {
  const { isSignedIn } = useAuth()
    const router = useRouter()
    const path = router.asPath
    const authentication = path === '/sign_out' || path === '/sign_up' || path === '/sign_in' || !isSignedIn() && path !== '/'

    return (
        <>
            {authentication&&<>
                {(!isSignedIn || path === '/sign_up')&&layoutProps?.children}
                {path !== '/sign_up'&&<SignIn/>}
            </>}
            {!authentication&&<>
                <div className="drawer drawer-mobile">
                    <input id = "my-drawer" type = "checkbox" className = "drawer-toggle" />
                    <div className="drawer-content">
                        <Topbar/>
                        <div className="container p-10 bg-[#F3F3F1] min-h-screen">
                            {layoutProps?.children}
                        </div>
                    </div>
                    <div className="drawer-side">
                        <label htmlFor="my-drawer" className="drawer-overlay"/>
                        <Sidebar/>
                    </div>
                </div>
            </>}
        </>

    )
}

export default Layout;