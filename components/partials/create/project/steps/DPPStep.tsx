import { Stack, TextField } from "@bbtgnn/polaris-interfacer";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { useTranslation } from "next-i18next";
import { Controller, useFormContext } from "react-hook-form";
import { CreateProjectValues } from "../CreateProjectForm";

export default function DPPStep() {
  const { t } = useTranslation("createProjectProps");
  const form = useFormContext<CreateProjectValues>();

  const DPP_FORM_KEY = "dpp";
  
  const { formState, control, watch } = form;
  const dpp = watch(DPP_FORM_KEY);

  const { errors } = formState;


  //

  return (
    <Stack vertical spacing="extraLoose">
          <PTitleSubtitle
            title={t("DPP")}
            subtitle={t(
              "The DPP (Digital Product Passport) is a digital record that contains information about a product's lifecycle, including its origin, materials, manufacturing processes, and end-of-life options. It aims to promote transparency, sustainability, and circular economy practices in the product industry."
            )}
          />
    <Controller
              control={control}
              name="dpp"
              render={({ field: { onChange, onBlur, name, value } }) => (
                <TextField
                  type="text"
                  id={name}
                  multiline={5}
                  name={name}
                  value={value}
                  autoComplete="off"
                  onChange={onChange}
                  onBlur={onBlur}
                  label={t("DPP:")}
                  helpText={t("Insert the DPP as JSON")}
                  error={errors.dpp?.message}
                />
              )}
            />
    </Stack>
    
  ); 
}