import { EconomicResource } from "lib/types";

import { Card, Text } from "@bbtgnn/polaris-interfacer";

//

export interface Props {
  resource: Partial<EconomicResource>;
}

//

const ResourceDetailsCard = (props: Props) => {
  const { resource } = props;

  return (
    <Card>
      <div className="p-4 flex space-x-4">
        <div className="w-20 h-20 rounded-md bg-gray-200" />
        <div>
          <Text as="h4" variant="bodyMd" fontWeight="bold">
            {resource.name}
          </Text>
          <Text as="p" variant="bodySm">
            {resource.note}
          </Text>
        </div>
      </div>
    </Card>
  );
};

//

export default ResourceDetailsCard;
