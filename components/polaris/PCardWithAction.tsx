import { Button, Card, Icon } from "@bbtgnn/polaris-interfacer";
import { CancelMinor } from "@shopify/polaris-icons";
import { FunctionComponent, ReactNode } from "react";

export interface Props {
  children?: ReactNode;
  icon?: FunctionComponent;
  onClick?: () => void;
}

export default function PCardWithAction(props: Props) {
  const { children, icon = CancelMinor, onClick = () => {} } = props;
  return (
    <Card sectioned>
      <div className="flex flex-row items-center">
        <div className="grow">{children}</div>
        <Button icon={<Icon source={icon} color="base" />} onClick={onClick} />
      </div>
    </Card>
  );
}
