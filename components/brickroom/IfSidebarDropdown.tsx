import React, { useEffect, useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/outline";
import IfSidebarItem, { IfSidebarItemProps } from "./IfSidebarItem";
import devLog from "../../lib/devLog";

//

export interface IfSidebarDropdownProps extends IfSidebarItemProps {
  children: Array<JSX.Element>;
  setClosed: (c: boolean) => void;
}

const IfSidebarDropdown = (props: IfSidebarDropdownProps) => {
  const [open, setOpen] = useState<boolean>(false);

  const upIcon = <ChevronUpIcon className="w-5 h-5" />;
  const downIcon = <ChevronDownIcon className="w-5 h-5" />;
  const handleClick = () => {
    if (props.closed) {
      props.setClosed(false);
      setOpen(!open);
    } else {
      // props.setClosed(false);
      setOpen(true);
    }
  };
  useEffect(() => {
    devLog("open", open, props.closed);
    if (props.closed) {
      setOpen(false);
    }
    devLog("open", open, props.closed);
  }, [props.closed]);

  return (
    <li className="flex flex-col items-stretch">
      {/* The button */}
      <button onClick={handleClick}>
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
