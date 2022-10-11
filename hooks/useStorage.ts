
type UseStorageReturnValue = {
  getItem: (key: string) => string;
  setItem: (key: string, value: string) => void;
  clear: () => void;
};

  const useStorage = (): UseStorageReturnValue => {
  // TODO: fix the prerendering by enforce client side rendering
  const isBrowser: boolean = ((): boolean => typeof window !== 'undefined')();
  const getItem = (key: string): string => {
    return isBrowser ? window["localStorage"][key] : undefined;
  };

  const setItem = (key: string, value: string): void => {
       return isBrowser ? window["localStorage"].setItem(key, value) : undefined;
  };

  const clear = () => {
    if (isBrowser)
        window["localStorage"].clear();
  }

  return {
    getItem,
    setItem,
    clear
  };
};

export default useStorage;
