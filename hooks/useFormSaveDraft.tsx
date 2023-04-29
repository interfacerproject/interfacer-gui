import { Button } from "@bbtgnn/polaris-interfacer";
import { CreateProjectValues } from "components/partials/create/project/CreateProjectForm";
import { ProjectType } from "components/types";
import { useLiveQuery } from "dexie-react-hooks";
import { DraftProject, db } from "lib/db";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

export interface DraftProjectType {
  name: string;
  type: ProjectType;
  project: CreateProjectValues;
}

type useDraftsReturnType = {
  drafts: DraftProject[] | undefined;
  draft: DraftProject | undefined;
  saveDraft: (
    project: DraftProjectType,
    cbOnSave?: ((id: number) => void) | undefined,
    cbOnError?: ((error: any) => void) | undefined
  ) => Promise<void>;
  deleteDraft: (id: number, cbOnDelete?: () => void, cbOnError?: ((error: any) => void) | undefined) => Promise<void>;
  editDraft: (
    id: number,
    project: DraftProjectType,
    cbOnEdit?: () => void,
    cbOnError?: ((error: any) => void) | undefined
  ) => Promise<void>;
};

export const useDrafts = (id?: number): useDraftsReturnType => {
  const drafts = useLiveQuery(() => db.projects.toArray());
  const [draft, setDraft] = useState<DraftProject | undefined>(undefined);
  useEffect(() => {
    const getD = async (id: number) =>
      db.projects
        .where("id")
        .equals(id)
        .first()
        .then(d => setDraft(d));
    if (id) getD(Number(id));
  }, [id]);
  async function saveDraft(
    project: DraftProjectType,
    cbOnSave?: (id: number) => void,
    cbOnError?: (error: any) => void
  ) {
    try {
      const id = await db.projects.add(project);
      cbOnSave && cbOnSave(Number(id));
    } catch (error) {
      cbOnError && cbOnError(error);
    }
  }
  async function deleteDraft(id: number, cbOnDelete?: () => void, cbOnError?: (error: any) => void) {
    try {
      await db.projects.delete(id);
      cbOnDelete && cbOnDelete();
    } catch (error) {
      cbOnError && cbOnError(error);
    }
  }
  async function editDraft(
    id: number,
    project: DraftProjectType,
    cbOnEdit?: () => void,
    cbOnError?: (error: any) => void
  ) {
    try {
      const itemToUpdate: DraftProjectType = {
        ...project,
      };
      await db.projects.update(id, itemToUpdate);
      cbOnEdit && cbOnEdit();
    } catch (error) {
      cbOnError && cbOnError(error);
    }
  }

  return { drafts, draft, saveDraft, deleteDraft, editDraft };
};

const useFormSaveDraft = (name: string, type: ProjectType, basePath = "/create/project") => {
  const { t } = useTranslation("common");
  const formContext = useFormContext();
  const { formState, getValues } = formContext;
  const router = useRouter();
  const { draft_id: id } = router.query;
  const [hasDraftChange, setHasDraftChange] = useState(false);
  const [draft, setDraft] = useState<DraftProject | undefined>();
  const [status, setStatus] = useState<string | null>(null);
  const { isDirty } = formState;
  const formValues = getValues();

  const {
    drafts,
    draft: dd,
    saveDraft: addDraft,
    deleteDraft: removeDraft,
    editDraft: updateDraft,
  } = useDrafts(Number(id));

  useEffect(() => {
    if (dd) {
      setDraft(dd);
      setHasDraftChange(isDirty && formValues !== dd);
    } else {
      setHasDraftChange(isDirty);
    }
  }, [dd, isDirty, formValues]);

  async function saveDraft() {
    await addDraft(
      {
        name,
        type,
        project: getValues() as CreateProjectValues,
      },
      id => {
        setHasDraftChange(false);
        router.query = {
          draft_saved: "true",
          draft_id: String(id),
        };
        router.push(router);
      },
      error => {
        setStatus(`Failed to add ${name}: ${error}`);
        console.log(status);
        console.error(error);
      }
    );
  }

  async function deleteDraft(id: number) {
    await removeDraft(
      id,
      () => {
        router.push(basePath + "?draft_deleted=true");
      },
      error => {
        setStatus(`Failed to delete ${name}: ${error}`);
        console.log(status);
        console.error(error);
      }
    );
  }
  async function editDraft(id: number) {
    console.log("editing");
    await updateDraft(
      id,
      {
        name,
        type,
        project: getValues() as CreateProjectValues,
      },
      () => {
        console.log("edited");
        setHasDraftChange(false);
        router.query = {
          draft_saved: "true",
          draft_id: String(id),
        };
        router.push(router);
        router.reload();
      },
      error => {
        setStatus(`Failed to edit ${name}: ${error}`);
        console.log(status);
        console.error(error);
      }
    );
  }
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
      <Button id="project-save-draft" disabled={!hasDraftChange} onClick={async () => await editDraft(Number(id))}>
        {t("Edit Draft")}
      </Button>
    );
  };

  const DeleteDraftButton = () => {
    if (!draft) return null;
    return (
      <Button id="project-delete-draft" onClick={() => deleteDraft(Number(id))}>
        {t("Delete Draft")}
      </Button>
    );
  };

  return { saveDraft, SaveDraftButton, DeleteDraftButton, EditDraftButton, drafts };
};

export default useFormSaveDraft;
