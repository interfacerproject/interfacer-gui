import { Popover } from "@bbtgnn/polaris-interfacer";
import { ChildrenProp } from "components/brickroom/types";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { TopbarButton } from "./TopbarButton";

//

export interface TopbarPopoverProps extends ChildrenProp {
  buttonContent?: React.ReactNode;
  notification?: boolean;
}

export default function TopbarPopover(props: TopbarPopoverProps) {
  const { children, notification = false, buttonContent } = props;
  const router = useRouter();

  const [popoverActive, setPopoverActive] = useState(false);
  const togglePopoverActive = useCallback(() => setPopoverActive(popoverActive => !popoverActive), []);

  useEffect(() => {
    router.events.on("routeChangeStart", () => {
      setPopoverActive(false);
    });
  }, [router.events]);

  const activator = (
    <TopbarButton onClick={togglePopoverActive} notification={notification}>
      {buttonContent}
    </TopbarButton>
  );

  return (
    <Popover active={popoverActive} activator={activator} onClose={togglePopoverActive} fullHeight>
      {children}
    </Popover>
  );
}
