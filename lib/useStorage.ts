
type StorageType = 'session' | 'local';

type UseStorageReturnValue = {
  getItem: (key: string, type?: StorageType) => string;
  setItem: (key: string, value: string, type?: StorageType) => boolean;
};

  const useStorage = (): UseStorageReturnValue => {
  const isBrowser: boolean = ((): boolean => typeof window !== 'undefined')();
  const storageType = (type?: StorageType): 'localStorage' | 'sessionStorage' => `${type ?? 'session'}Storage`;

  const getItem = (key: string, type?: StorageType): string => {
    return isBrowser ? window[storageType(type)][key] : '';
  };

  const setItem = (key: string, value: string, type?: StorageType): boolean => {
    if (isBrowser) {
        window[storageType(type)].setItem(key, value);
        return true;
    }

    return false;
  };

  return {
    getItem,
    setItem
  };
};

export default useStorage;
