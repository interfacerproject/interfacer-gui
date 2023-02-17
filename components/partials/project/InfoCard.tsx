import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";

// Components
import { Card, Stack, Text } from "@bbtgnn/polaris-interfacer";
import BrDisplayUser from "components/brickroom/BrDisplayUser";
import LicensesDisplay from "./actionsCard/LicensesDisplay";

//

export interface InfoCardProps {
  project: EconomicResource;
}

//

export default function InfoCard(props: InfoCardProps) {
  const { t } = useTranslation();
  const { project } = props;

  // Fake licenses
  const licenses: Array<{ scope: string; licenseId: string }> = [
    { scope: "software", licenseId: "MIT" },
    { scope: "hardware", licenseId: "Adobe-2006" },
    { scope: "docs", licenseId: "AAL" },
  ];

  return (
    <Card>
      <div className="p-4">
        <Stack vertical spacing="loose">
          <div>
            <Text as="p" variant="bodyMd" fontWeight="medium">
              {"ID"}
            </Text>
            <p className="text-primary font-mono">{project.id}</p>
          </div>

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

          <Stack vertical spacing="extraTight">
            <Text as="p" variant="bodyMd" fontWeight="medium">
              {t("Licenses")}
            </Text>
            <LicensesDisplay scopedLicenses={licenses} />
          </Stack>
        </Stack>
      </div>
    </Card>
  );
}
