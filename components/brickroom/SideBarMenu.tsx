import React from 'react';

import SideBarButton from "./SideBarButton";
import { useRouter } from "next/router";

type SideBarMenuProps = { menu: Array<{ name: string, link: string, svg?: any, disabled?:boolean }>, title?: string }


function Sidebar({ menu, title }: SideBarMenuProps) {
    const router = useRouter()
    const isActive = (path: string) => path === router.asPath
    return (<>
        <h4 className="mt-8 ml-4">
            {title}
        </h4>
        <ul className="m-4 mb-4 overflow-y-auto border border-white rounded-xl w-60 text-base-content">
            {menu.map((m) => <li key={m.name}>
                <SideBarButton
                    text={m.name}
                    link={m.link}
                    active={isActive(m.link)}
                    svg={m?.svg}
                    disabled={m?.disabled}
                /></li>)}
        </ul>
    </>
    )
}

export default Sidebar;