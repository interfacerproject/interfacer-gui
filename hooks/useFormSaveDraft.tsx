import { Button } from "@bbtgnn/polaris-interfacer";
import { ProjectType } from "components/types";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import useStorage from "./useStorage";

const useFormSaveDraft = (name?: string, basePath = "/create/project", tableName = "draft") => {
  const { setItem, getItem, removeItem, items } = useStorage();
  const { t } = useTranslation("common");
  const formContext = useFormContext() || undefined;
  const { formState, getValues } = formContext || {};
  const router = useRouter();
  const { draft_id } = router.query;
  const [hasDraftChange, setHasDraftChange] = useState(false);
  const { isDirty } = formState || {};
  const formValues = JSON.stringify(getValues && getValues());
  const draftsSaved = getItem("draft") && JSON.parse(getItem("draft"));
  const draft = draftsSaved?.find((item: any) => item.id === Number(draft_id));
  const draftName = draft?.name || name;

  const progressiveId = draftsSaved?.map((item: any) => item.id).sort((a: number, b: number) => b - a)[0] + 1 || 0;
  useEffect(() => {
    setHasDraftChange(isDirty && formValues !== draft);
  }, [isDirty, formValues, draft]);
  const saveDraft = () => {
    const newItem = {
      id: progressiveId,
      name: draftName,
      type: ProjectType.DESIGN,
      project: getValues(),
    };
    const draftTable = getItem("draft");
    draftTable
      ? setItem("draft", JSON.stringify([...JSON.parse(draftTable), newItem]))
      : setItem("draft", JSON.stringify([newItem]));
    // setItem(prefix + name, JSON.stringify(getValues()));
    setHasDraftChange(false);
    router.query = {
      draft_saved: "true",
      draft_id: newItem.id,
    };
    router.push(router);
  };
  const deleteDraft = (id: number) => {
    setItem("draft", JSON.stringify(draftsSaved?.filter((draft: any) => draft.id !== id)));
    router.push(basePath + "?draft_deleted=true");
  };
  const editDraft = (id: number) => {
    if (!draft) return;
    const index = draftsSaved.indexOf(draft);
    draftsSaved[index] = {
      ...draft,
      project: getValues(),
    };
    setItem("draft", JSON.stringify(draftsSaved));
    router.query = {
      draft_saved: "true",
      draft_id: draft.id,
    };
    router.push(router);
    router.reload();
  };
  const SaveDraftButton = () => {
    if (draft) return null;
    return (
      <Button id="project-save-draft" disabled={!hasDraftChange} onClick={saveDraft}>
        {t("Save Draft")}
      </Button>
    );
  };
  const EditDraftButton = () => {
    if (!draft) return null;
    return (
      <Button id="project-save-draft" disabled={!hasDraftChange} onClick={() => editDraft(Number(draft_id))}>
        {t("Edit Draft")}
      </Button>
    );
  };
  const DeleteDraftButton = () => {
    if (!draft) return null;
    return (
      <Button id="project-delete-draft" onClick={() => deleteDraft(Number(draft_id))}>
        {t("Delete Draft")}
      </Button>
    );
  };

  return { hasDraftChange, saveDraft, deleteDraft, SaveDraftButton, DeleteDraftButton, EditDraftButton, draftsSaved };
};

export default useFormSaveDraft;
