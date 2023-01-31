import { useTranslation } from "next-i18next";
import { useCallback, useState } from "react";

// Components
import { Button, ChoiceList, Icon, Link, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { PlusMinor } from "@shopify/polaris-icons";
import AddLink, { Link as ILink } from "components/AddLink";
import PCardWithAction from "components/polaris/PCardWithAction";
import PFieldInfo from "components/polaris/PFieldInfo";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
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

  const { formState, handleSubmit, register, control, setValue, watch } = form;
  const { isValid, errors, isSubmitting } = formState;

  // Consumer services

  const [repair, setRepair] = useState(["yes"]);
  const handleRepairChange = useCallback((value: Array<string>) => setRepair(value), []);

  const [recycle, setRecycle] = useState(["yes"]);
  const handleRecycleChange = useCallback((value: Array<string>) => setRecycle(value), []);

  const choices = [
    { label: "Yes", value: "true" },
    { label: "No", value: "false" },
  ];

  // Links to certifications

  const [certifications, setCertifications] = useState<Array<ILink>>([]);

  const [showAddLink, setShowAddLink] = useState(false);

  function handleShowAddLink() {
    setShowAddLink(true);
  }

  function handleDiscard() {
    setShowAddLink(false);
  }

  function addCertification(link: ILink) {
    if (!link) return;
    setCertifications([...certifications, link]);
    setShowAddLink(false);
  }

  function removeCertification(certification: ILink) {
    setCertifications(certifications.filter(c => c !== certification));
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
      >
        <Controller
          control={control}
          name="repairable"
          render={({ field: { onChange, value } }) => (
            <ChoiceList
              title={t("Availability for repairing")}
              choices={choices}
              selected={[value]}
              onChange={onChange}
              titleHidden
            />
          )}
        />
      </PFieldInfo>

      <PFieldInfo
        label={t("Availability for recycling")}
        helpText={t("Refer to the standards we want to follow for this field")}
      >
        <Controller
          control={control}
          name="recyclable"
          render={({ field: { onChange, value } }) => (
            <ChoiceList
              title={t("Availability for recycling")}
              choices={choices}
              selected={[value]}
              onChange={onChange}
              titleHidden
            />
          )}
        />
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

      {certifications.length && (
        <Stack spacing="tight" vertical>
          {certifications.map((c, i) => (
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
