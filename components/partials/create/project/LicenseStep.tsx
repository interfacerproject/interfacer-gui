import { useTranslation } from "next-i18next";
import { useState } from "react";

// Components
import { Button, Icon, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { PlusMinor } from "@shopify/polaris-icons";
import AddLicense, { ScopedLicense } from "components/AddLicense";
import LicenseDisplay from "components/LicenseDisplay";
import PCardWithAction from "components/polaris/PCardWithAction";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";

//

export interface Props {}

export default function LicenseStep(props: Props) {
  const { t } = useTranslation();

  const [showAdd, setShowAdd] = useState(false);

  const [licenses, setLicenses] = useState<Array<ScopedLicense>>([]);

  function handleShowAdd() {
    setShowAdd(true);
  }

  function handleAdd(license: ScopedLicense) {
    setLicenses([...licenses, license]);
    setShowAdd(false);
  }

  function handleDiscard() {
    setShowAdd(false);
  }

  function removeLicense(license: ScopedLicense) {
    setLicenses(licenses.filter(l => l !== license));
  }

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle title={t("Set license")} subtitle={t("Specify how you want to license your repo")} />

      {!showAdd && (
        <Button onClick={handleShowAdd} fullWidth icon={<Icon source={PlusMinor} />}>
          {t("Add a license")}
        </Button>
      )}

      {showAdd && <AddLicense onAdd={handleAdd} onDiscard={handleDiscard} />}

      {licenses.length && (
        <Stack spacing="tight" vertical>
          <Text variant="bodyMd" as="p">
            {t("Selected licenses")}
          </Text>
          {licenses.map((l, i) => (
            <PCardWithAction
              key={l.license.licenseId}
              onClick={() => {
                removeLicense(l);
              }}
            >
              <LicenseDisplay license={l.license} label={l.scope} />
            </PCardWithAction>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
