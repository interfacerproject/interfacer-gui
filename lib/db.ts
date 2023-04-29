import { CreateProjectValues } from "components/partials/create/project/CreateProjectForm";
import { ProjectType } from "components/types";
import Dexie, { Table } from "dexie";

export interface DraftProject {
  id?: number;
  name: string;
  type: ProjectType;
  project: CreateProjectValues;
}

export class MySubClassedDexie extends Dexie {
  projects!: Table<DraftProject>;

  constructor() {
    super("myDatabase");
    this.version(1).stores({
      projects: "++id, name, type, projects", // Primary key and indexed props
    });
  }
}

export const db = new MySubClassedDexie();
