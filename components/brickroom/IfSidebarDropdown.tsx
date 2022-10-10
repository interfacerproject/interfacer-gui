import React, { useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/outline";
import IfSidebarItem, { IfSidebarItemProps } from "./IfSidebarItem";

//

export interface IfSidebarDropdownProps extends IfSidebarItemProps {
    children: Array<JSX.Element>;
}

export default (props: IfSidebarDropdownProps) => {
    const [open, setOpen] = useState(false);

    const upIcon = <ChevronUpIcon className="w-5 h-5" />;
    const downIcon = <ChevronDownIcon className="w-5 h-5" />;

    return (
        <li className="flex flex-col items-stretch">
            {/* The button */}
            <button onClick={() => setOpen(!open)}>
                <IfSidebarItem
                    {...props}
                    rightIcon={open ? upIcon : downIcon}
                />
            </button>

            {/* The space that opens up */}
            {open && (
                <ul className="pl-7 space-y-1 mt-1">
                    <>{props.children}</>
                </ul>
            )}
        </li>
    );
};
