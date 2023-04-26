import { Button } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import useStorage from "./useStorage";

const useFormSaveDraft = (name?: string, prefix = "form-draft-") => {
  const { setItem, getItem, removeItem, items } = useStorage();
  const { t } = useTranslation("common");
  const formContext = useFormContext() || undefined;
  const { formState, getValues } = formContext || {};
  const router = useRouter();
  const [hasDraftChange, setHasDraftChange] = useState(false);
  const { draft_name } = router.query;
  const draftName = draft_name || name;
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
  };
  const onDeleteDraft = (draftName: string) => removeItem(draftName);
  const SaveDraftButton = () => (
    <Button id="project-save-draft" disabled={!hasDraftChange} onClick={onSaveDraft}>
      {t("Save Draft")}
    </Button>
  );
  return { hasDraftChange, onSaveDraft, onDeleteDraft, SaveDraftButton, draftsSaved };
};

export default useFormSaveDraft;
