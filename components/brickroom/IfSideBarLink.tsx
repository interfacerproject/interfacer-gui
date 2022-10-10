import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import IfSidebarItem, { IfSidebarItemProps } from "./IfSidebarItem";

//

export interface IfSideBarLinkProps extends IfSidebarItemProps {
    link: string;
    target?: string;
}

export default (props: IfSideBarLinkProps) => {
    const { link, target, disabled } = props;

    // Adding active state
    const router = useRouter();
    const active = link === router.asPath;

    // The core item
    const item = <IfSidebarItem {...props} active={active} />;

    // The item with the link
    const wrappedItem = (
        <Link href={link} passHref>
            <a target={target}>{item}</a>
        </Link>
    );

    return <li>{disabled ? item : wrappedItem}</li>;
};
