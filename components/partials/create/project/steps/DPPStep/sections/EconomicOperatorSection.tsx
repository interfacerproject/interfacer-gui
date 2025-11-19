import { Stack } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import { ControlledTextField } from "../components/ControlledTextField";

export const EconomicOperatorSection = () => {
  const { t } = useTranslation("createProjectProps");

  return (
    <Stack vertical spacing="loose">
      <ControlledTextField name="dpp.economicOperator.companyName.value" label={t("Company name")} />

      <ControlledTextField name="dpp.economicOperator.gln.value" label={t("GLN")} />

      <ControlledTextField name="dpp.economicOperator.eoriNumber.value" label={t("EORI number")} />

      <ControlledTextField
        name="dpp.economicOperator.addressLine1.value"
        label={t("Address line 1 (street & house number)")}
      />

      <ControlledTextField
        name="dpp.economicOperator.addressLine2.value"
        label={t("Address line 2 (postal code & city)")}
      />

      <ControlledTextField
        name="dpp.economicOperator.contactInformation.value"
        label={t("Contact information (email)")}
        placeholder="ex. mylink.com"
        helpText={t("Lorem ipsum dolor sit amet.")}
      />
    </Stack>
  );
};
