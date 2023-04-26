import { Button } from "@bbtgnn/polaris-interfacer";
import useFormSaveDraft from "hooks/useFormSaveDraft";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useFormContext } from "react-hook-form";

export default function CreateProjectSubmit() {
  const { t } = useTranslation();
  const router = useRouter();
  const prefix = router.asPath.split("/")[3];
  const { formState, getValues } = useFormContext();
  const { isValid } = formState;
  const { SaveDraftButton } = useFormSaveDraft(`${prefix}-${getValues("main.title")}`);

  return (
    <div className="sticky bottom-0 right-0 z-30 bg-background p-3 border-t-1 border-t-border-subdued">
      <div className="flex flex-row justify-end gap-2">
        <SaveDraftButton />
        <Button id="project-create-submit" submit primary disabled={!isValid}>
          {t("Submit!")}
        </Button>
      </div>
    </div>
  );
}
