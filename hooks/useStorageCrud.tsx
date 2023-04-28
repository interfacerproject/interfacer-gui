import useStorage from "./useStorage";

type Id = string | number;

export interface StorageItem {
  id: Id;
}

export type StorageTable = StorageItem[];

export type UseStorageReturnType = {
  save: (data: StorageItem) => void;
  update: (id: Id, data: StorageItem) => void;
  remove: (id: Id) => void;
  get: (id?: Id) => any;
};

const useStorageCRUD = (tableName: string): UseStorageReturnType => {
  const { getItem, setItem } = useStorage();

  const getTable = (tableName: string): StorageTable =>
    getItem(tableName) ? JSON.parse(getItem(tableName)) : undefined;

  const save = (data: StorageItem) => {
    const table = getTable(tableName);
    table ? setItem(tableName, JSON.stringify([...table, data])) : setItem(tableName, JSON.stringify([data]));
  };

  const update = (id: Id, data: StorageItem) => {
    const table = getTable(tableName);
    const itemToUpdate = table.find((item: StorageItem) => item.id === id);
    if (!itemToUpdate) throw new Error(`Item with id ${id} not found in table ${tableName}`);
    const index = table.indexOf(itemToUpdate);
    table[index] = data;
    setItem(tableName, JSON.stringify(table));
  };

  const remove = (id: Id) => {
    const table = getTable(tableName);
    const itemToRemove = table.find((item: StorageItem) => item.id === id);
    if (!itemToRemove) throw new Error(`Item with id ${id} not found in table ${tableName}`);
    const index = table.indexOf(itemToRemove);
    table.splice(index, 1);
    setItem(tableName, JSON.stringify(table));
  };

  const get = (id?: Id) => {
    const table = getTable(tableName);
    return id ? table.find((item: StorageItem) => item.id === id) : table;
  };

  return { save, update, remove, get };
};

export default useStorageCRUD;
