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
import PLabel from "components/polaris/PLabel";
import { formSetValueOptions } from "lib/formSetValueOptions";
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
  const { t } = useTranslation("createProjectProps");

  const { formState, setValue, watch } = useFormContext<CreateProjectValues>();
  const { errors } = formState;

  // Consumer services

  const choices = [
    { label: t("Yes – Available"), value: YES_NO[0] },
    { label: t("No – Not available"), value: YES_NO[1] },
  ];

  function setRepairable(value: string) {
    setValue("declarations.repairable", value, formSetValueOptions);
  }

  function setRecyclable(value: string) {
    setValue("declarations.recyclable", value, formSetValueOptions);
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
  const certifications = watch(CERTIFICATIONS_FORM_KEY);

  function addCertification(link: ILink) {
    setValue(CERTIFICATIONS_FORM_KEY, [...certifications, link], formSetValueOptions);
    setShowAddLink(false);
  }

  function removeCertification(certification: ILink) {
    setValue(
      CERTIFICATIONS_FORM_KEY,
      certifications.filter(c => c !== certification),
      formSetValueOptions
    );
  }

  //

  const spacer = <div className="h-4" />;

  return (
    <Stack vertical spacing="loose">
      <PTitleSubtitle
        title={t("Self declarations")}
        subtitle={t(
          "By making a self-declaration, you are providing valuable information to others who may be interested in your product."
        )}
      />

      {spacer}

      <Stack vertical spacing="extraLoose">
        <PFieldInfo
          label={t("Availability for recycling")}
          helpText={t("Indicate whether you are available to recycle your product at the end of its useful life.")}
          error={errors.declarations?.recyclable?.message}
          requiredIndicator
        >
          <div className="py-1">
            <PButtonRadio options={choices} onChange={setRecyclable} selected={watch("declarations.recyclable")} />
          </div>
        </PFieldInfo>

        <PFieldInfo
          label={t("Availability for repairing")}
          helpText={t(
            "Indicate whether you are available to repair your product in case of any issues or malfunctions."
          )}
          error={errors.declarations?.repairable?.message}
          requiredIndicator
        >
          <div className="py-1">
            <PButtonRadio options={choices} onChange={setRepairable} selected={watch("declarations.repairable")} />
          </div>
        </PFieldInfo>
      </Stack>

      {spacer}

      <Stack vertical>
        <PLabel label={t("Certifications")} />
        {!showAddLink && (
          <Button onClick={handleShowAddLink} fullWidth icon={<Icon source={PlusMinor} />}>
            {t("Add a certification")}
          </Button>
        )}

        {showAddLink && (
          <AddLink
            onDiscard={handleDiscard}
            onSubmit={addCertification}
            textLabel={t("Certification scope")}
            urlLabel={t("Certification link")}
            addButtonLabel={t("Add certification")}
          />
        )}

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
    </Stack>
  );
}
