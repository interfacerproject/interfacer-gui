import { Card, Icon, Tag, Text } from "@bbtgnn/polaris-interfacer";
import { DynamicSourceMinor } from "@shopify/polaris-icons";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";

//

export interface Props {
  resource: Partial<EconomicResource> | null | undefined;
}

//

const ResourceDetailsCard = (props: Props) => {
  const { resource } = props;
  const { t } = useTranslation("common");

  if (!resource) return null;

  // Preparing data

  let image = "";
  if (resource.images && resource.images.length > 0) {
    const imageFile = resource.images[0];
    image = `data:${imageFile.mimeType};base64,${imageFile.bin}`;
  }

  const type = resource.conformsTo?.name;
  const owner = resource.primaryAccountable?.name;

  return (
    <Card>
      <div className="p-4 flex flex-row items-start space-x-4">
        <div className="w-20 h-20 rounded-md bg-gray-200 overflow-hidden flex items-center justify-center">
          {image && <img src={image} alt="" className="w-full h-full object-cover" />}
          {!image && <Icon color="subdued" source={DynamicSourceMinor} />}
        </div>

        <div className="grow">
          <Text as="h4" variant="headingMd" fontWeight="bold">
            {resource.name}
          </Text>
          {owner && (
            <Text as="p" variant="bodyMd">
              <span className="after:content-[':_']">{t("Owner")}</span>
              <span className="font-mono font-bold">{owner}</span>
            </Text>
          )}
        </div>

        {type && <Tag>{resource.conformsTo?.name}</Tag>}
      </div>
    </Card>
  );
};

//

export default ResourceDetailsCard;
