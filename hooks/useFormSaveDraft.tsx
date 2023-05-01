import { Button } from "@bbtgnn/polaris-interfacer";
import { CreateProjectValues } from "components/partials/create/project/CreateProjectForm";
import { ProjectType } from "components/types";
import { IndexableType } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import useIndexedDb, { DraftProject } from "lib/db";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

export interface DraftProjectType {
  name: string;
  type: ProjectType;
  project: CreateProjectValues;
}

enum CommandTable {
  PROJECTS = "projects",
}

enum Commands {
  ADD = "add",
  DELETE = "delete",
  UPDATE = "update",
}

interface Command<T> {
  table: CommandTable;
  data?: T;
  id?: IndexableType;
  action: Commands;
  cbOnSuccess?: (id?: IndexableType) => void;
  cbOnError?: (error: any) => void;
}

type DraftCallbacks = {
  cbOnEdit?: (id?: IndexableType) => void;
  cbOnError?: (error: any) => void;
};

interface DraftOperationResult<T = IndexableType> {
  error: any;
  idReturned?: T;
}

type SaveDraftFunction = (project: DraftProjectType, callbacks?: DraftCallbacks) => Promise<DraftOperationResult>;

type EditDraftFunction = (
  id: number,
  project: DraftProjectType,
  callbacks?: DraftCallbacks
) => Promise<DraftOperationResult>;

type DeleteDraftFunction = (id: number, callbacks?: DraftCallbacks) => Promise<{ error: any }>;

type useDraftsReturnType = {
  drafts: DraftProject[] | undefined;
  draft: DraftProject | undefined;
  saveDraft: SaveDraftFunction;
  deleteDraft: DeleteDraftFunction;
  editDraft: EditDraftFunction;
};

export const useDrafts = (id?: number): useDraftsReturnType => {
  const db = useIndexedDb();
  const drafts = useLiveQuery(() => db.projects.toArray());
  const draft = useLiveQuery(() =>
    db.projects
      .where("id")
      .equals(id || 0)
      .first()
  );

  const executeCommand = async (command: Command<DraftProjectType>) => {
    let error;
    let idReturned: IndexableType | undefined = undefined;

    const { table, data, action, cbOnSuccess, cbOnError, id } = command;

    try {
      switch (action) {
        case Commands.ADD:
          if (!data) {
            throw new Error("No data provided");
          }
          idReturned = await db[table].add(data);
          break;
        case Commands.DELETE:
          if (!id) {
            throw new Error("No id provided");
          }
          await db[table].delete(id);
          break;
        case Commands.UPDATE:
          if (!id || !data) {
            throw new Error("No id or data provided");
          }
          await db[table].update(id, data);
          break;
      }
      if (cbOnSuccess) {
        cbOnSuccess(idReturned || id);
      }
    } catch (error) {
      error = error;
      if (cbOnError) {
        cbOnError(error);
      }
    }
    return { error, idReturned };
  };

  const saveDraft: SaveDraftFunction = async (project, callbacks) =>
    await executeCommand({
      table: CommandTable.PROJECTS,
      data: project,
      action: Commands.ADD,
      cbOnSuccess: callbacks?.cbOnEdit,
      cbOnError: callbacks?.cbOnError,
    });
  const deleteDraft: DeleteDraftFunction = async (id, callbacks) =>
    await executeCommand({
      table: CommandTable.PROJECTS,
      action: Commands.DELETE,
      id,
      cbOnSuccess: callbacks?.cbOnEdit,
      cbOnError: callbacks?.cbOnError,
    });

  const editDraft: EditDraftFunction = async (id, project, callbacks) =>
    await executeCommand({
      table: CommandTable.PROJECTS,
      action: Commands.UPDATE,
      id,
      data: project,
      cbOnSuccess: callbacks?.cbOnEdit,
      cbOnError: callbacks?.cbOnError,
    });

  return { drafts, draft, saveDraft, deleteDraft, editDraft };
};

type UseFormSaveDraftReturnType = {
  SaveDraftButton: () => JSX.Element | null;
  DeleteDraftButton: () => JSX.Element | null;
  EditDraftButton: () => JSX.Element | null;
};

const useFormSaveDraft = (
  name: string,
  type: ProjectType,
  basePath = "/create/project"
): UseFormSaveDraftReturnType => {
  const { t } = useTranslation("common");
  const formContext = useFormContext();
  const { formState, getValues } = formContext;
  const router = useRouter();
  const { draft_id: id } = router.query;
  const [hasDraftChange, setHasDraftChange] = useState(false);
  const [draft, setDraft] = useState<DraftProject | undefined>();
  const { isDirty } = formState;
  const formValues = getValues() as CreateProjectValues;
  const draftToSave = {
    name,
    type,
    project: formValues,
  };

  const onPositiveChanges = (id: IndexableType | undefined) => {
    setHasDraftChange(false);
    router.query = {
      draft_saved: "true",
      draft_id: String(id),
    };
    router.push(router).then(() => router.reload());
  };

  const onPsitiveErrors = (error: any) => {
    console.error(error);
    router.query = {
      draft_saved: "false",
    };
    router.push(router);
  };

  const {
    draft: currentDraft,
    saveDraft: addDraft,
    deleteDraft: removeDraft,
    editDraft: updateDraft,
  } = useDrafts(Number(id));

  useEffect(() => {
    if (currentDraft) {
      setDraft(currentDraft);
      setHasDraftChange(isDirty && formValues !== currentDraft.project);
    } else {
      setHasDraftChange(isDirty);
    }
  }, [currentDraft, isDirty, formValues]);

  async function saveDraft() {
    await addDraft(draftToSave, {
      cbOnEdit: onPositiveChanges,
      cbOnError: onPsitiveErrors,
    });
  }

  async function deleteDraft(id: number) {
    await removeDraft(id, {
      cbOnEdit: () => {
        router.push(basePath + "?draft_deleted=true");
      },
      cbOnError: error => {
        console.error(error);
        router.query = {
          draft_deleted: "false",
        };
        router.push(router);
      },
    });
  }
  async function editDraft(id: number) {
    await updateDraft(id, draftToSave, {
      cbOnEdit: onPositiveChanges,
      cbOnError: onPsitiveErrors,
    });
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

  return { SaveDraftButton, DeleteDraftButton, EditDraftButton };
};

export default useFormSaveDraft;
