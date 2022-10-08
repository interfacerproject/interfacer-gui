import React, { useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/outline";
import IfSidebarItem, { IfSidebarItemProps } from "./IfSidebarItem";

//

export interface IfSidebarDropdownProps extends IfSidebarItemProps {
  children: Array<JSX.Element>;
}

const IfSidebarDropdown = (props: IfSidebarDropdownProps) => {
  const [open, setOpen] = useState(false);

  const upIcon = <ChevronUpIcon className="w-5 h-5" />;
  const downIcon = <ChevronDownIcon className="w-5 h-5" />;

  return (
    <li className="flex flex-col items-stretch">
      {/* The button */}
      <button onClick={() => setOpen(!open)}>
        <IfSidebarItem {...props} rightIcon={open ? upIcon : downIcon} />
      </button>

      {/* The space that opens up */}
      {open && (
        <ul className="mt-1 space-y-1 pl-7">
          <>{props.children}</>
        </ul>
      )}
    </li>
  );
};

export default IfSidebarDropdown;
