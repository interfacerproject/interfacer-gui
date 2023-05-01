import { useUser } from "components/layout/FetchUserLayout";
import { CreateProjectValues } from "components/partials/create/project/CreateProjectForm";
import { ProjectType } from "components/types";
import Dexie, { Table } from "dexie";
import { useAuth } from "hooks/useAuth";

export interface DraftProject {
  id?: number;
  name: string;
  type: ProjectType;
  project: CreateProjectValues;
}

export class UserStorage extends Dexie {
  projects!: Table<DraftProject>;

  constructor(user: string) {
    super(`@${user}`);
    this.version(1).stores({
      projects: "++id, name, type, projects",
    });
  }
}

const useIndexedDb = () => {
  const { user } = useAuth();
  const db = new UserStorage(user?.username || "");
  return db;
};

export default useIndexedDb;

// export const db = new MySubClassedDexie();
