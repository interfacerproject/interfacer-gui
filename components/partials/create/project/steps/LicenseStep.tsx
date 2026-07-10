import { useTranslation } from "next-i18next";
import { useState } from "react";

// Components
import { Button, Icon, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { PlusMinor } from "@shopify/polaris-icons";
import AddLicense, { ScopedLicense } from "components/AddLicense";
import LicenseDisplay from "components/LicenseDisplay";
import PCardWithAction from "components/polaris/PCardWithAction";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { useFormContext } from "react-hook-form";
import { CreateProjectValues } from "../CreateProjectForm";

export { type LicenseStepValues, licenseStepSchema, licenseStepDefaultValues } from "./LicenseStep.schema";

//

export default function LicenseStep() {
  const { t } = useTranslation("createProjectProps");

  const { setValue, watch } = useFormContext<CreateProjectValues>();

  const [showAdd, setShowAdd] = useState(false);

  function handleShowAdd() {
    setShowAdd(true);
  }

  function handleDiscard() {
    setShowAdd(false);
  }

  const LICENSES_FORM_KEY = "licenses";
  const licenses = watch(LICENSES_FORM_KEY);

  function handleAdd(license: ScopedLicense) {
    setValue(
      LICENSES_FORM_KEY,
      [...licenses, { licenseId: license.license.licenseId, scope: license.scope }],
      formSetValueOptions
    );
    setShowAdd(false);
  }

  function removeLicense(licenseId: string) {
    setValue(
      LICENSES_FORM_KEY,
      licenses.filter(l => l.licenseId !== licenseId),
      formSetValueOptions
    );
  }

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle
        title={t("Set license")}
        subtitle={t(
          "Choosing the right license for your open source hardware project is an important step in making your work accessible and collaborative."
        )}
      />

      {!showAdd && (
        <Button id="add-license" onClick={handleShowAdd} fullWidth icon={<Icon source={PlusMinor} />}>
          {t("Add new license")}
        </Button>
      )}

      {showAdd && <AddLicense onAdd={handleAdd} onDiscard={handleDiscard} />}

      {licenses.length && (
        <Stack spacing="tight" vertical>
          <Text variant="bodyMd" as="p">
            {t("Added licenses")}
          </Text>
          {licenses.map((l, i) => (
            <PCardWithAction
              key={l.licenseId}
              onClick={() => {
                removeLicense(l.licenseId);
              }}
            >
              <LicenseDisplay licenseId={l.licenseId} label={l.scope} />
            </PCardWithAction>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
