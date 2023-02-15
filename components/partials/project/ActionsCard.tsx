import { LinkMinor } from "@shopify/polaris-icons";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";

// Partials
import StarButton from "components/partials/project/buttons/StarButton";
import WatchButton from "components/partials/project/buttons/WatchButton";
import AddToListButton from "./buttons/AddToListButton";

// Components
import { Button, Card, Icon, Stack } from "@bbtgnn/polaris-interfacer";

//

export interface ActionsCardProps {
  project: EconomicResource;
}

export default function ActionsCard(props: ActionsCardProps) {
  const { t } = useTranslation();
  const { project } = props;

  return (
    <Card sectioned>
      <Stack vertical spacing="baseTight">
        {project.repo && (
          <Button url={project.repo} icon={<Icon source={LinkMinor} />} fullWidth>
            {t("Go to source")}
          </Button>
        )}
        <AddToListButton project={project} />
        <WatchButton id={project.id} owner={project.primaryAccountable.id} />
        <StarButton id={project.id} owner={project.primaryAccountable.id} />
      </Stack>
    </Card>
  );
}
