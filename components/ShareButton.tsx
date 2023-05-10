import { Button, Icon, Popover } from "@bbtgnn/polaris-interfacer";
import { ShareMinor } from "@shopify/polaris-icons";
import { useCallback, useState } from "react";
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";
import { ChildrenProp } from "./brickroom/types";

export default function ShareButton({ size = 36 }) {
  const [popoverActive, setPopoverActive] = useState(false);

  const togglePopoverActive = useCallback(() => setPopoverActive(popoverActive => !popoverActive), []);

  type ButtonComp = typeof EmailShareButton;
  type IconComp = typeof EmailIcon;
  type IconProps = React.ComponentProps<typeof EmailIcon>;

  const socials: Array<{ shareButton: ButtonComp; icon: IconComp; iconProps?: IconProps }> = [
    {
      shareButton: EmailShareButton,
      icon: EmailIcon,
      iconProps: {
        size: size * 1.3,
      },
    },
    {
      shareButton: FacebookShareButton,
      icon: FacebookIcon,
      iconProps: {
        bgStyle: { fill: "transparent" },
        size: size * 1.3,
      },
    },
    {
      shareButton: TwitterShareButton,
      icon: TwitterIcon,
      iconProps: {
        size: size * 1.3,
      },
    },
    {
      shareButton: WhatsappShareButton,
      icon: WhatsappIcon,
    },
    {
      shareButton: TelegramShareButton,
      icon: TelegramIcon,
    },
  ];

  const iconsCommonProps: IconProps = {
    bgStyle: { fill: "transparent" },
    size,
    borderRadius: 16,
    iconFillColor: "#4b5563",
  };

  const ButtonWrapper = ({ children }: ChildrenProp) => {
    const squareSize = `${size}px`;
    return (
      <div
        style={{ width: squareSize, height: squareSize }}
        className="shrink-0 rounded-md hover:cursor-pointer hover:ring-primary hover:fill-primary hover:ring-2 hover:bg-primary/5 flex items-center justify-center overflow-hidden"
      >
        {children}
      </div>
    );
  };

  return (
    <Popover
      active={popoverActive}
      activator={
        <Button id="likeButton" onClick={togglePopoverActive} size="medium" icon={<Icon source={ShareMinor} />}>
          {"Share"}
        </Button>
      }
      onClose={togglePopoverActive}
      fullHeight
    >
      <div className="flex p-3 space-x-3">
        {socials.map(s => (
          <ButtonWrapper key={s.icon.name}>
            <s.shareButton url={window.location.href}>
              <s.icon {...iconsCommonProps} {...s.iconProps} />
            </s.shareButton>
          </ButtonWrapper>
        ))}
      </div>
    </Popover>
  );
}
