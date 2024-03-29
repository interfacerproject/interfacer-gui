import { ChildrenProp } from "components/brickroom/types";

export interface TopbarButtonProps extends ChildrenProp {
  onClick?: () => void;
  notification?: boolean;
  id?: string;
}

export function TopbarButton(props: TopbarButtonProps) {
  const { onClick = () => {}, children, notification = true, id } = props;
  return (
    <button
      id={id}
      onClick={onClick}
      className="
        w-12 h-12
        border-1 border-border-subdued rounded-full
        hover:ring-primary hover:ring-2 relative
        flex items-center justify-center"
    >
      {notification && (
        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-1 border-border-subdued bg-white rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
        </div>
      )}
      <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
        {children}
        {!children && <div className="w-full h-full bg-gray-300" />}
      </div>
    </button>
  );
}
