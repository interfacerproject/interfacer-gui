import { LinkMinor } from "@shopify/polaris-icons";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";

// Partials
import BrDisplayUser from "components/brickroom/BrDisplayUser";
import AddToListButton from "./buttons/AddToListButton";
import StarButton from "./buttons/StarButton";
import WatchButton from "./buttons/WatchButton";
import LicensesDisplay from "./LicensesDisplay";

// Components
import { Button, Card, Icon, Stack, Text } from "@bbtgnn/polaris-interfacer";

//

export interface ActionsCardProps {
  project: EconomicResource;
}

export default function ActionsCard(props: ActionsCardProps) {
  const { t } = useTranslation();
  const { project } = props;

  // Fake licenses
  const licenses: Array<{ scope: string; licenseId: string }> = [
    { scope: "software", licenseId: "MIT" },
    { scope: "hardware", licenseId: "Adobe-2006" },
    { scope: "docs", licenseId: "AAL" },
  ];

  return (
    <Card sectioned>
      <Stack vertical spacing="loose">
        <Stack vertical spacing="baseTight">
          {/* {project.repo && (
            <Button url={project.repo} icon={<Icon source={LinkMinor} />} fullWidth>
              {t("Go to source")}
            </Button>
          )} */}
          <Button url={project.repo!} icon={<Icon source={LinkMinor} />} fullWidth>
            {t("Go to source")}
          </Button>
          <AddToListButton project={project} />
          <WatchButton id={project.id} owner={project.primaryAccountable.id} />
          <StarButton id={project.id} owner={project.primaryAccountable.id} />
        </Stack>

        <Stack vertical spacing="extraTight">
          <Text as="p" variant="bodyMd" fontWeight="medium">
            {t("Resource owner")}
          </Text>
          <BrDisplayUser
            id={project.primaryAccountable.id}
            name={project.primaryAccountable.name}
            location={project.currentLocation?.name}
          />
        </Stack>

        <LicensesDisplay label={t("Licenses")} scopedLicenses={licenses} />

        {/* Source */}
      </Stack>
    </Card>
  );
}
