import { Card, Tag, Text } from "@bbtgnn/polaris-interfacer";
import { getResourceImage } from "lib/resourceImages";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import ResourceCardThumb from "./ResourceThumb";

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

  const image = getResourceImage(resource);
  const type = resource.conformsTo?.name;
  const owner = resource.primaryAccountable?.name;

  return (
    <Card>
      <div className="p-4 flex flex-row items-start space-x-4">
        <ResourceCardThumb image={image} />

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
