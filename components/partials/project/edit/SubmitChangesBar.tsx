import { Button, Icon, Text } from "@bbtgnn/polaris-interfacer";
import { CancelMinor, EditMinor } from "@shopify/polaris-icons";
import { useTranslation } from "next-i18next";
import { useFormContext } from "react-hook-form";

export interface SubmitChangesProps {}

export default function SubmitChangesBar(props: SubmitChangesProps) {
  const { t } = useTranslation();
  const { formState, reset } = useFormContext();
  const { isValid, isDirty } = formState;
  console.log(formState, isValid, isDirty);

  function handleReset() {
    reset();
  }

  return (
    <>
      {isDirty && (
        <div className="bg-yellow-100 border-t-1 border-t-border-warning-subdued p-4 flex justify-end items-center space-x-6 sticky bottom-0 z-20">
          <Text variant="bodyMd" as="p">
            {t("You have unsaved changes")}
          </Text>

          <div className="space-x-2">
            <Button onClick={handleReset} icon={<Icon source={CancelMinor} />}>
              {t("Discard changes")}
            </Button>

            <Button primary submit disabled={!isValid} icon={<Icon source={EditMinor} />}>
              {t("Update")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
