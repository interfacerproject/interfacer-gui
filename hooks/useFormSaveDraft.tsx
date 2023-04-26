import { Button } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import useStorage from "./useStorage";

const useFormSaveDraft = (name?: string, basePath = "/create/project", prefix = "form-draft-") => {
  const { setItem, getItem, removeItem, items } = useStorage();
  const { t } = useTranslation("common");
  const formContext = useFormContext() || undefined;
  const { formState, getValues } = formContext || {};
  const router = useRouter();
  const [hasDraftChange, setHasDraftChange] = useState(false);
  const { draft_name } = router.query;
  //@ts-ignore
  const draftName = draft_name?.split("-")[3] || name;
  const { isDirty } = formState || {};
  const formValues = JSON.stringify(getValues && getValues());
  const draft = getItem(prefix + String(draftName));
  const draftsSaved = items && Object.keys(items).filter(item => item.startsWith(prefix));

  useEffect(() => {
    setHasDraftChange(isDirty && formValues !== draft);
  }, [isDirty, formValues, draft]);
  const onSaveDraft = () => {
    setItem(prefix + String(draftName), JSON.stringify(getValues()));
    setHasDraftChange(false);
    router.query = {
      draft_saved: "true",
      draft_name: draftName,
    };
    router.push(router);
  };
  const onDeleteDraft = (draftName: string) => {
    removeItem(draftName);
    router.push(basePath + "?draft_deleted=true");
  };
  const SaveDraftButton = () => (
    <Button id="project-save-draft" disabled={!hasDraftChange} onClick={onSaveDraft}>
      {t("Save Draft")}
    </Button>
  );
  const DeleteDraftButton = () => {
    if (!draftName) return null;
    return (
      <Button id="project-delete-draft" onClick={() => onDeleteDraft(String(draftName))}>
        {t("Delete Draft")}
      </Button>
    );
  };

  return { hasDraftChange, onSaveDraft, onDeleteDraft, SaveDraftButton, DeleteDraftButton, draftsSaved };
};

export default useFormSaveDraft;
