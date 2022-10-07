import classNames from "classnames";
import IfSidebarTag from "./IfSidebarTag";

export interface IfSidebarItemProps {
    text: string;
    tag?: string;
    disabled?: boolean;
    active?: boolean;
    leftIcon?: JSX.Element;
    rightIcon?: JSX.Element;
}

export default ({
    text,
    tag,
    leftIcon,
    rightIcon,
    disabled = false,
    active = false,
}: IfSidebarItemProps) => {
    const classes = classNames({
        // Base styles
        "flex flex-row justify-between": true,
        "btn btn-ghost font-medium normal-case rounded-lg border-2": true,
        // Disabled styles
        "text-primary hover:bg-amber-200": !disabled,
        "btn-disabled text-gray-400 border-0": disabled,
        // Active styles
        "border-none": !active,
        "border-amber-200": active,
    });

    return (
        <div className={classes}>
            {/* Left side */}
            <div className="flex flex-row justify-start items-center space-x-2">
                {leftIcon}
                <p>{text}</p>
            </div>
            {/* Right side */}
            <div className="flex flex-row justify-end items-center space-x-2">
                {tag && <IfSidebarTag text={tag} />}
                <p>{rightIcon}</p>
            </div>
        </div>
    );
};
