import { Button, Icon } from "@bbtgnn/polaris-interfacer";
import { CancelMinor } from "@shopify/polaris-icons";
import classNames from "classnames";

export interface FullWidthBannerProps {
  children?: React.ReactNode;
  open: boolean;
  onClose?: () => void;
  status?: "success" | "info" | "basic";
}

export default function FullWidthBanner(props: FullWidthBannerProps) {
  const { children, open, onClose, status = "success" } = props;

  const classes = classNames("px-4 py-3 flex items-center border-b-1 space-x-4", {
    "border-b-border-success bg-green-100": status === "success",
    "border-b-border-highlight bg-blue-100": status === "info",
    "border-b-border-subdued": status === "basic",
    "justify-between": Boolean(onClose),
    "justify-center": !Boolean(onClose),
  });

  return (
    <>
      {open && (
        <div className={classes}>
          {children}
          {onClose && <Button plain size="slim" onClick={onClose} icon={<Icon source={CancelMinor}></Icon>} />}
        </div>
      )}
    </>
  );
}
