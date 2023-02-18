import { Button, Icon } from "@bbtgnn/polaris-interfacer";
import { CancelMinor } from "@shopify/polaris-icons";

export interface FullWidthBannerProps {
  children?: React.ReactNode;
  open: boolean;
  onClose?: () => void;
}

export default function FullWidthBanner(props: FullWidthBannerProps) {
  const { children, open, onClose } = props;
  console.log(open);

  return (
    <>
      {open && (
        <div className="p-4 flex justify-between items-center border-b-1 border-b-border-success bg-green-100 ">
          <div>{children}</div>
          {onClose && <Button plain size="slim" onClick={onClose} icon={<Icon source={CancelMinor}></Icon>} />}
        </div>
      )}
    </>
  );
}
