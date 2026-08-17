import { Button, Icon, Text } from "@bbtgnn/polaris-interfacer";
import { CancelMinor, EditMinor } from "@shopify/polaris-icons";
import { useTranslation } from "next-i18next";
import { useFormContext } from "react-hook-form";

export interface SubmitChangesProps {}

export default function SubmitChangesBar(props: SubmitChangesProps) {
  const { t } = useTranslation();
  const { formState, reset } = useFormContext();
  const { isValid, isDirty } = formState;

  function handleReset() {
    reset();
  }

  return (
    <>
      {isDirty && (
        <div
          className="bg-yellow-100 border-t-1 border-t-border-warning-subdued px-4 py-3 flex flex-wrap justify-end items-center gap-3 sm:gap-6 sticky bottom-0 z-20"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <Text variant="bodyMd" as="p">
            {t("You have unsaved changes")}
          </Text>

          <div className="flex flex-wrap gap-2">
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
