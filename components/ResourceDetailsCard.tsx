import { Card, Tag, Text } from "@bbtgnn/polaris-interfacer";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import ProjectThumb from "./ProjectThumb";
import { useQuery } from "@apollo/client";
import { QUERY_RESOURCE } from "../lib/QueryAndMutation";
import devLog from "../lib/devLog";

//

export interface Props {
  resource: Partial<EconomicResource> | null | undefined;
}

//

const ResourceDetailsCard = (props: Props) => {
  const { resource } = props;
  const { t } = useTranslation("common");

  const { data } = useQuery(QUERY_RESOURCE, { variables: { id: resource?.id } });

  if (!resource) return null;

  // Preparing data
  const type = resource.conformsTo?.name;
  const owner = resource.primaryAccountable?.name;

  return (
    <Card>
      <div className="p-4 flex flex-row items-start space-x-4">
        <ProjectThumb project={data?.economicResource} />

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
