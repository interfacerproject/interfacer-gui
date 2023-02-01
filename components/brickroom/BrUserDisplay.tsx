import { Icon, Text } from "@bbtgnn/polaris-interfacer";
import { LocationsMinor } from "@shopify/polaris-icons";
import { Agent } from "lib/types";
import BrUserAvatar from "./BrUserAvatar";

export interface Props {
  user: Agent;
}

export default function BrUserDisplay(props: Props) {
  const { user } = props;

  return (
    <div className="flex flex-row items-center">
      <div className="w-12">
        <BrUserAvatar name={user.name} />
      </div>

      <div className="ml-4">
        <Text as="p" variant="bodyMd" fontWeight="bold">
          {user.name}
        </Text>
        {user.primaryLocation && (
          <div className="flex items-center text-primary">
            <Icon source={LocationsMinor} color="subdued" />
            <Text as="p" variant="bodyMd" color="subdued">
              {user.primaryLocation.name}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
