import { File, Maybe, Person } from "./index";

export type FileEssential = Pick<File, "mimeType" | "bin">;
export type PersonWithFileEssential = Omit<Person, "images"> & { images: Maybe<Array<FileEssential>> };
