import { useTranslation } from "next-i18next";
import { useState } from "react";

// Components
import { Button, Icon, Link, Stack } from "@bbtgnn/polaris-interfacer";
import { PlusMinor } from "@shopify/polaris-icons";
import AddLink, { Link as ILink } from "components/AddLink";
import PButtonRadio from "components/polaris/PButtonRadio";
import PCardWithAction from "components/polaris/PCardWithAction";
import PFieldInfo from "components/polaris/PFieldInfo";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";

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

  const hr = <hr className="border-t-[1px] border-t-border-neutral-subdued" />;

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle title={t("Self declarations")} subtitle={t("Lorem ipsum dolor sit amet.")} />

      {hr}

      <PTitleSubtitle title={t("Consumer services")} subtitle={t("Lorem ipsum dolor sit amet.")} titleTag="h2" />

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

      {hr}

      <PTitleSubtitle title={t("Links to certifications")} subtitle={t("(Optional field)")} titleTag="h2" />

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
