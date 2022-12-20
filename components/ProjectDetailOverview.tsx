import { Stack, Text } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import MdParser from "../lib/MdParser";
import { EconomicResource } from "../lib/types";
import BrTags from "./brickroom/BrTags";

const ProjectDetailOverview = ({ project }: { project: EconomicResource }) => {
  const { t } = useTranslation("common");

  const license = project?.license;
  const tags = project?.classifiedAs;
  const text = project?.note;

  return (
    <Stack vertical>
      {text && <div dangerouslySetInnerHTML={{ __html: MdParser.render(text) }} />}

      {tags && (
        <div>
          <Text as="h2" variant="headingMd">
            {t("Tags")}
          </Text>
          <BrTags tags={tags} />
        </div>
      )}

      {license && (
        <div>
          <Text as="h2" variant="headingMd">
            {t("License")}
          </Text>
          <p>{license}</p>
        </div>
      )}
    </Stack>
  );
};

export default ProjectDetailOverview;
