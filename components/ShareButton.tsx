import { Button, Icon, Popover, Stack } from "@bbtgnn/polaris-interfacer";
import { ShareMinor } from "@shopify/polaris-icons";
import { useCallback, useState } from "react";
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  HatenaIcon,
  HatenaShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";
const ShareButton = ({ size = 36 }) => {
  const [popoverActive, setPopoverActive] = useState(false);

  const togglePopoverActive = useCallback(() => setPopoverActive(popoverActive => !popoverActive), []);

  return (
    <Popover
      active={popoverActive}
      activator={
        <Button id="likeButton" onClick={togglePopoverActive} size="medium" icon={<Icon source={ShareMinor} />}>
          {"Share"}
        </Button>
      }
      onClose={togglePopoverActive}
    >
      <div className="p-1 w-20 h-full">
        <Stack vertical spacing="extraTight" alignment="center">
          <EmailShareButton url={window.location.href}>
            <EmailIcon round size={size} />
          </EmailShareButton>
          <FacebookShareButton url={window.location.href}>
            <FacebookIcon round size={size} />
          </FacebookShareButton>
          <TwitterShareButton url={window.location.href}>
            <TwitterIcon round size={size} />
          </TwitterShareButton>
          <WhatsappShareButton url={window.location.href}>
            <WhatsappIcon round size={size} />
          </WhatsappShareButton>
          <TelegramShareButton url={window.location.href}>
            <TelegramIcon round size={size} />
          </TelegramShareButton>
          <HatenaShareButton url={window.location.href}>
            <HatenaIcon round size={size} />
          </HatenaShareButton>
        </Stack>
      </div>
    </Popover>
  );
};

export default ShareButton;
