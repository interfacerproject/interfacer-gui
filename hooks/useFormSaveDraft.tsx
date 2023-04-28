import { Button } from "@bbtgnn/polaris-interfacer";
import { CreateProjectValues } from "components/partials/create/project/CreateProjectForm";
import { ProjectType } from "components/types";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import useStorage from "./useStorage";
import useStorageCRUD, { StorageItem } from "./useStorageCrud";

export interface DraftProjectType extends StorageItem {
  name: string;
  type: ProjectType;
  project: CreateProjectValues;
}

const useFormSaveDraft = (name: string, type: ProjectType, basePath = "/create/project", tableName = "draft") => {
  const { getItem } = useStorage();
  const { save, update, remove, get } = useStorageCRUD(tableName);
  const { t } = useTranslation("common");
  const formContext = useFormContext();
  const { formState, getValues } = formContext;
  const router = useRouter();
  const { draft_id } = router.query;
  const [hasDraftChange, setHasDraftChange] = useState(false);
  const { isDirty } = formState;
  const formValues = getValues();
  const draftsSaved = getItem("draft") && JSON.parse(getItem("draft"));
  const draft: DraftProjectType = get(Number(draft_id))?.project;

  const progressiveId = draftsSaved?.map((item: any) => item.id).sort((a: number, b: number) => b - a)[0] + 1 || 0;

  useEffect(() => {
    setHasDraftChange(isDirty && formValues !== draft);
  }, [isDirty, formValues, draft]);

  const saveDraft = () => {
    const newItem: DraftProjectType = {
      id: progressiveId,
      name: name,
      type: ProjectType.DESIGN,
      project: getValues() as CreateProjectValues,
    };
    save(newItem);
    setHasDraftChange(false);
    router.query = {
      draft_saved: "true",
      draft_id: String(newItem.id),
    };
    router.push(router);
  };

  const deleteDraft = (id: number) => {
    remove(id);
    router.push(basePath + "?draft_deleted=true");
  };

  const editDraft = (id: number) => {
    try {
      const itemToUpdate: DraftProjectType = {
        id,
        name: name,
        type: ProjectType.DESIGN,
        project: getValues() as CreateProjectValues,
      };
      update(id, itemToUpdate);
    } catch (error) {
      console.error(error);
    }
    setHasDraftChange(false);
    router.query = {
      draft_saved: "true",
      draft_id: String(draft.id),
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

  return { saveDraft, SaveDraftButton, DeleteDraftButton, EditDraftButton };
};

export default useFormSaveDraft;
