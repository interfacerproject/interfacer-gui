import { useTranslation } from "next-i18next";
import { useState } from "react";

// Components
import { Button, Icon, Link, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { PlusMinor } from "@shopify/polaris-icons";
import AddLink, { Link as ILink } from "components/AddLink";
import PButtonRadio from "components/polaris/PButtonRadio";
import PCardWithAction from "components/polaris/PCardWithAction";
import PFieldInfo from "components/polaris/PFieldInfo";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

//

export interface FormValues {
  repairable: string;
  recyclable: string;
  certifications: Array<ILink>;
}

export interface Props {}

export default function DeclarationsStep(props: Props) {
  const { t } = useTranslation();

  //

  const defaultValues: FormValues = {
    repairable: "yes",
    recyclable: "yes",
    certifications: [],
  };

  const schema = yup.object().shape({
    repairable: yup.string().oneOf(["yes", "no"]).required(),
    recyclable: yup.string().oneOf(["yes", "no"]).required(),
    certifications: yup.array().of(
      yup.object().shape({
        url: yup.string().url().required(),
        label: yup.string().required(),
      })
    ),
  });

  const form = useForm<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { formState, setValue, watch } = form;
  const { isValid, errors, isSubmitting } = formState;

  // Consumer services

  const choices = [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ];

  function setRepairable(value: string) {
    setValue("repairable", value);
  }

  function setRecyclable(value: string) {
    setValue("recyclable", value);
  }

  // Links to certifications

  const [showAddLink, setShowAddLink] = useState(false);

  function handleShowAddLink() {
    setShowAddLink(true);
  }

  function handleDiscard() {
    setShowAddLink(false);
  }

  function addCertification(link: ILink) {
    if (!link) return;
    setValue("certifications", [...watch("certifications"), link]);
    setShowAddLink(false);
  }

  function removeCertification(certification: ILink) {
    setValue(
      "certifications",
      watch("certifications").filter(c => c !== certification)
    );
  }

  //

  return (
    <Stack vertical spacing="extraLoose">
      <Stack vertical spacing="extraTight">
        <Text variant="heading3xl" as="h1">
          {t("Self declarations")}
        </Text>
        <Text variant="bodyMd" as="p">
          {t("Lorem ipsum dolor sit amet.")}
        </Text>
      </Stack>

      <hr />

      <Stack vertical spacing="extraTight">
        <Text variant="headingXl" as="h2">
          {t("Consumer services")}
        </Text>
        <Text variant="bodyMd" as="p">
          {t("Lorem ipsum dolor sit amet.")}
        </Text>
      </Stack>

      <PFieldInfo
        label={t("Availability for repairing")}
        helpText={t("Refer to the standards we want to follow for this field")}
        requiredIndicator
      >
        <div className="py-1">
          <PButtonRadio options={choices} onChange={setRepairable} />
        </div>
      </PFieldInfo>

      <PFieldInfo
        label={t("Availability for recycling")}
        helpText={t("Refer to the standards we want to follow for this field")}
        requiredIndicator
      >
        <div className="py-1">
          <PButtonRadio options={choices} onChange={setRecyclable} />
        </div>
      </PFieldInfo>

      <hr />

      <Stack vertical spacing="extraTight">
        <Text variant="headingXl" as="h2">
          {t("Links to certifications")}
        </Text>
        <Text variant="bodyMd" as="p">
          {t("(Optional field)")}
        </Text>
      </Stack>

      {!showAddLink && (
        <Button onClick={handleShowAddLink} fullWidth icon={<Icon source={PlusMinor} />}>
          {t("Add a certification")}
        </Button>
      )}

      {showAddLink && <AddLink onDiscard={handleDiscard} onSubmit={addCertification} />}

      {watch("certifications").length && (
        <Stack spacing="tight" vertical>
          {watch("certifications").map((c, i) => (
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
          ))}
        </Stack>
      )}
    </Stack>
  );
}
