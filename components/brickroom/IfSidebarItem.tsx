import classNames from "classnames";
import IfSidebarTag from "./IfSidebarTag";

export interface IfSidebarItemProps {
  text: string;
  tag?: string;
  disabled?: boolean;
  active?: boolean;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
  closed?: boolean;
}

const IfSidebarItem = ({
  text,
  tag,
  leftIcon,
  rightIcon,
  disabled = false,
  active = false,
  closed = true,
}: IfSidebarItemProps) => {
  const classes = classNames({
    // Base styles
    "flex flex-row ": true,
    "justify-between": !closed,
    "btn btn-ghost font-medium normal-case rounded-lg border-2": true,
    "justify-end": closed,
    // Disabled styles
    "text-primary hover:bg-amber-200": !disabled,
    "btn-disabled text-gray-400 border-0": disabled,
    // Active styles
    "border-none": !active,
    "border-amber-200": active && !closed,
    "border-r-amber-200 border-r-8 pr-2": active && closed,
  });

  return (
    <div className={classes}>
      {/* Left side */}
      <div className="flex flex-row items-center justify-start space-x-2">
        {leftIcon}
        {!closed && <p>{text}</p>}
      </div>
      {/*Right side*/}
      <div className="flex flex-row items-center justify-end space-x-2">
        {tag && !closed && (
          <>
            <IfSidebarTag text={tag} />
            <p>{rightIcon}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default IfSidebarItem;
