import { Button } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import { useFormContext } from "react-hook-form";

export default function CreateProjectSubmit() {
  const { t } = useTranslation();
  const { formState } = useFormContext();
  const { isValid } = formState;

  return (
    <div className="sticky bottom-0 right-0 z-30 bg-background p-3 border-t-1 border-t-border-subdued">
      <div className="flex flex-row justify-end">
        <Button submit primary disabled={!isValid}>
          {t("Submit!")}
        </Button>
      </div>
    </div>
  );
}
