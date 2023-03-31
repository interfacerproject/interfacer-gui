import { Button, Card, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { ParentChild } from "@carbon/icons-react";
import { useProject } from "components/layout/FetchProjectLayout";
import { useTranslation } from "next-i18next";
import { useProjectTabs } from "pages/project/[id]";

const RelationsCard = () => {
  const { t } = useTranslation("common");
  const { project } = useProject();
  const { setSelected } = useProjectTabs();
  return (
    <Card sectioned>
      <Stack vertical spacing="loose">
        <Text as="h2" variant="headingMd">
          {t("Relations")}
        </Text>
        <Text color="success" as="p" variant="bodyMd">
          {t("{{related}} related projects", { related: project.metadata?.relations?.length || 0 })}
        </Text>
        <Button
          id="seeRelations"
          icon={<ParentChild />}
          size="large"
          fullWidth
          monochrome
          onClick={() => setSelected(1)}
        >
          {t("All relations")}
        </Button>
      </Stack>
    </Card>
  );
};

export default RelationsCard;
