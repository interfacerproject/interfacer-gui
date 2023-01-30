import { Button, Card, ChoiceList, Link, Stack, Text, TextField } from "@bbtgnn/polaris-interfacer";
import PCardWithAction from "components/polaris/PCardWithAction";
import PFieldInfo from "components/polaris/PFieldInfo";
import { useTranslation } from "next-i18next";
import { useCallback, useState } from "react";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

//

export interface FormValues {
  repairable: string;
  recyclable: string;
  certifications: Array<Link>;
}

export interface Link {
  url: string;
  label: string;
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

  const [certifications, setCertifications] = useState<Array<Link>>([]);

  const [url, setUrl] = useState("");
  const handleUrlChange = useCallback((value: string) => setUrl(value), []);

  const [label, setLabel] = useState("");
  const handleLabelChange = useCallback((value: string) => setLabel(value), []);

  const [addingMore, setAddingMore] = useState(false);

  function addCertification() {
    if (!url || !label) return;
    setCertifications([...certifications, { url, label }]);
    setUrl("");
    setLabel("");
    setAddingMore(false);
  }

  function addMore() {
    setAddingMore(true);
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
        <Text variant="headingXl" as="h1">
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
        <Text variant="headingXl" as="h1">
          {t("Links to certifications")}
        </Text>
        <Text variant="bodyMd" as="p">
          {t("Lorem ipsum dolor sit amet.")}
        </Text>
      </Stack>

      {certifications.length && (
        <Stack spacing="tight" vertical>
          {certifications.map((certification, index) => (
            <PCardWithAction key={index}>
              <Link url={certification.url} external>
                {certification.label}
              </Link>
            </PCardWithAction>
          ))}
        </Stack>
      )}

      {(!certifications.length || addingMore) && (
        <Card sectioned>
          <Stack vertical spacing="loose">
            <TextField
              label={t("Link title")}
              helpText={t("A short text to clearly name the certification")}
              autoComplete="off"
              onChange={handleLabelChange}
              value={label}
            />
            <TextField
              label={t("External link")}
              autoComplete="off"
              type="url"
              value={url}
              onChange={handleUrlChange}
            />
            <div className="flex justify-end pt-4">
              <Button onClick={addCertification}>{t("Add link")}</Button>
            </div>
          </Stack>
        </Card>
      )}

      {certifications.length && !addingMore && <Button onClick={addMore}>{t("Add more links")}</Button>}
    </Stack>
  );
}
