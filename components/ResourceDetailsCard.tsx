import { Card, Icon, Stack, Tag, Text } from "@bbtgnn/polaris-interfacer";
import { DynamicSourceMinor } from "@shopify/polaris-icons";
import { EconomicResource } from "lib/types";

//

export interface Props {
  resource: Partial<EconomicResource> | null | undefined;
}

//

const ResourceDetailsCard = (props: Props) => {
  const { resource } = props;

  if (!resource) return null;

  // Preparing data

  let image = "";
  if (resource.images && resource.images.length > 0) {
    const imageFile = resource.images[0];
    image = `data:${imageFile.mimeType};base64,${imageFile.bin}`;
  }

  const type = resource.conformsTo?.name;

  return (
    <Card>
      <div className="p-4 flex flex-row items-center space-x-4">
        <div className="w-20 h-20 rounded-md bg-gray-200 overflow-hidden flex items-center justify-center">
          {image && <img src={image} alt="" className="w-full h-full object-cover" />}
          {!image && <Icon color="subdued" source={DynamicSourceMinor} />}
        </div>

        <Stack vertical spacing="extraTight">
          <Text as="h4" variant="headingMd" fontWeight="bold">
            {resource.name}
          </Text>
          {type && <Tag>{resource.conformsTo?.name}</Tag>}
        </Stack>
      </div>
    </Card>
  );
};

//

export default ResourceDetailsCard;
