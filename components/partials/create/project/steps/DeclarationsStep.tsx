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
import { useFormContext } from "react-hook-form";
import * as yup from "yup";
import { CreateProjectValues } from "../CreateProjectForm";

//

const YES_NO = ["yes", "no"] as const;

export interface DeclarationsStepValues {
  repairable: string;
  recyclable: string;
  certifications: Array<ILink>;
}

export const declarationsStepSchema = yup.object({
  repairable: yup
    .string()
    .required()
    .oneOf([...YES_NO]),
  recyclable: yup
    .string()
    .required()
    .oneOf([...YES_NO]),
  certifications: yup.array().of(
    yup.object().shape({
      url: yup.string().url().required(),
      label: yup.string().required(),
    })
  ),
});

export const declarationsStepDefaultValues: DeclarationsStepValues = {
  repairable: "",
  recyclable: "",
  certifications: [],
};

//

export type DeclarationsStepData = DeclarationsStepValues | null;

export interface Props {
  onValid?: (values: DeclarationsStepData) => void;
}

export default function DeclarationsStep(props: Props) {
  const { t } = useTranslation();

  const { formState, setValue, getValues, watch } = useFormContext<CreateProjectValues>();
  const { errors } = formState;

  // Consumer services

  const choices = [
    { label: "Yes", value: YES_NO[0] },
    { label: "No", value: YES_NO[1] },
  ];

  function setRepairable(value: string) {
    setValue("declarations.repairable", value, { shouldValidate: true });
  }

  function setRecyclable(value: string) {
    setValue("declarations.recyclable", value, { shouldValidate: true });
  }

  // Links to certifications

  const [showAddLink, setShowAddLink] = useState(false);

  function handleShowAddLink() {
    setShowAddLink(true);
  }

  function handleDiscard() {
    setShowAddLink(false);
  }

  const CERTIFICATIONS_FORM_KEY = "declarations.certifications";

  function addCertification(link: ILink) {
    setValue(CERTIFICATIONS_FORM_KEY, [...getValues(CERTIFICATIONS_FORM_KEY), link]);
    setShowAddLink(false);
  }

  function removeCertification(certification: ILink) {
    setValue(
      CERTIFICATIONS_FORM_KEY,
      getValues(CERTIFICATIONS_FORM_KEY).filter(c => c !== certification)
    );
  }

  //

  const spacer = <div className="h-4" />;

  return (
    <Stack vertical spacing="loose">
      <PTitleSubtitle title={t("Self declarations")} subtitle={t("Lorem ipsum dolor sit amet.")} />

      {spacer}

      <Stack vertical spacing="extraLoose">
        <PTitleSubtitle title={t("Consumer services")} subtitle={t("Lorem ipsum dolor sit amet.")} titleTag="h2" />

        <PFieldInfo
          label={t("Availability for repairing")}
          helpText={t("Refer to the standards we want to follow for this field")}
          error={errors.declarations?.repairable?.message}
          requiredIndicator
        >
          <div className="py-1">
            <PButtonRadio options={choices} onChange={setRepairable} selected={getValues("declarations.repairable")} />
          </div>
        </PFieldInfo>

        <PFieldInfo
          label={t("Availability for recycling")}
          helpText={t("Refer to the standards we want to follow for this field")}
          error={errors.declarations?.recyclable?.message}
          requiredIndicator
        >
          <div className="py-1">
            <PButtonRadio options={choices} onChange={setRecyclable} selected={getValues("declarations.recyclable")} />
          </div>
        </PFieldInfo>
      </Stack>

      {spacer}

      <PTitleSubtitle title={t("Links to certifications")} subtitle={t("(Optional field)")} titleTag="h2" />

      {!showAddLink && (
        <Button onClick={handleShowAddLink} fullWidth icon={<Icon source={PlusMinor} />}>
          {t("Add a certification")}
        </Button>
      )}

      {showAddLink && <AddLink onDiscard={handleDiscard} onSubmit={addCertification} />}

      {watch(CERTIFICATIONS_FORM_KEY).length && (
        <Stack spacing="tight" vertical>
          {watch(CERTIFICATIONS_FORM_KEY).map((c, i) => (
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
