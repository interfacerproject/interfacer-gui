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
  const { draft_name } = router.query;
  const draftName = draft_name && draft_name.toString().split("-").slice(2).join("-");
  const [hasDraftChange, setHasDraftChange] = useState(false);
  const { isDirty } = formState || {};
  const formValues = JSON.stringify(getValues && getValues());
  const draft = getItem(prefix + name);
  const draftsSaved =
    items &&
    Object.keys(items)
      .map(k => k.startsWith(prefix) && JSON.parse(items[k]))
      .filter(item => item);

  console.log("draftsSaved", draftsSaved);

  useEffect(() => {
    setHasDraftChange(isDirty && formValues !== draft);
  }, [isDirty, formValues, draft]);
  const saveDraft = () => {
    setItem(prefix + name, JSON.stringify(getValues()));
    setHasDraftChange(false);
    router.query = {
      draft_saved: "true",
      draft_name: prefix + name,
    };
    router.push(router);
  };
  const deleteDraft = (item: string) => {
    removeItem(item);
    router.push(basePath + "?draft_deleted=true");
  };
  const SaveDraftButton = () => (
    <Button id="project-save-draft" disabled={!hasDraftChange} onClick={saveDraft}>
      {t("Save Draft")}
    </Button>
  );
  const DeleteDraftButton = () => {
    if (!name) return null;
    return (
      <Button id="project-delete-draft" onClick={() => deleteDraft(prefix + draftName)}>
        {t("Delete Draft")}
      </Button>
    );
  };

  return { hasDraftChange, saveDraft, deleteDraft, SaveDraftButton, DeleteDraftButton, draftsSaved };
};

export default useFormSaveDraft;
