import { Stack } from "@bbtgnn/polaris-interfacer";
import PButtonRadio from "components/polaris/PButtonRadio";
import PLabel from "components/polaris/PLabel";
import { useTranslation } from "next-i18next";
import { Controller, useFormContext } from "react-hook-form";

interface YesNoRadioFieldProps {
  label: string;
  name: string;
  id: string;
}

export const YesNoRadioField = ({ label, name, id }: YesNoRadioFieldProps) => {
  const { control } = useFormContext();
  const { t } = useTranslation("createProjectProps");

  return (
    <Stack vertical spacing="tight">
      <PLabel label={label} />
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <PButtonRadio
            id={id}
            selected={value}
            onChange={onChange}
            options={[
              { value: "yes", label: t("Yes") },
              { value: "no", label: t("No") },
            ]}
          />
        )}
      />
    </Stack>
  );
};
