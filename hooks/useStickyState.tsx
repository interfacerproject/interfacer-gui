import React from "react";
import useStorage from "./useStorage";

const useStickyState = (defaultValue: any, key: string) => {
  const { getItem, setItem } = useStorage();
  const [value, setValue] = React.useState(() => {
    const stickyValue = getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });
  React.useEffect(() => {
    setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
};

export default useStickyState;
