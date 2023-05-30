import { Button } from "@bbtgnn/polaris-interfacer";
import { ProjectType } from "components/types";
import useFormSaveDraft from "hooks/useFormSaveDraft";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useFormContext } from "react-hook-form";

export default function CreateProjectSubmit() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const type = router.asPath.split("/")[3].split("?")[0];
  const typeAsProjectType = type.charAt(0).toUpperCase() + type.slice(1);
  const { formState, getValues } = useFormContext();
  const { isValid } = formState;
  const { SaveDraftButton, DeleteDraftButton, EditDraftButton } = useFormSaveDraft(
    `${getValues("main.title")}`,
    typeAsProjectType as ProjectType
  );

  return (
    <div className="sticky bottom-0 right-0 z-30 bg-background p-3 border-t-1 border-t-border-subdued">
      <div className="flex flex-row justify-end gap-2">
        <DeleteDraftButton />
        <EditDraftButton />
        <SaveDraftButton />
        <Button id="project-create-submit" submit primary disabled={!isValid}>
          {t("Submit!")}
        </Button>
      </div>
    </div>
  );
}
