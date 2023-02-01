import { Button, Icon, Stack } from "@bbtgnn/polaris-interfacer";
import { PlusMinor } from "@shopify/polaris-icons";
import AddLicense from "components/AddLicense";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { useTranslation } from "next-i18next";
import { useState } from "react";

export interface Props {}

interface License {
  for: string;
  name: string;
}

export default function LicenseStep(props: Props) {
  const { t } = useTranslation();

  const [showAdd, setShowAdd] = useState(false);

  const [licenses, setLicenses] = useState<Array<License>>([]);

  function handleShowAdd() {
    setShowAdd(true);
  }

  function handleDiscard() {
    setShowAdd(false);
  }

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle title={t("Set license")} subtitle={t("Specify how you want to license your repo")} />

      {!showAdd && (
        <Button onClick={handleShowAdd} fullWidth icon={<Icon source={PlusMinor} />}>
          {t("Add a license")}
        </Button>
      )}

      {showAdd && <AddLicense />}

      {licenses.length && (
        <Stack spacing="tight" vertical>
          {JSON.stringify(licenses)}
          {/* {licenses.map((c, i) => (
              <PCardWithAction
                key={c.url}
                onClick={() => {
                  removeCertification(c);
                }}
              >
                <Link url={c.url} external>
                  {c.label}
                </Link>
              </PCardWithAction>
            ))} */}
        </Stack>
      )}
    </Stack>
  );
}
