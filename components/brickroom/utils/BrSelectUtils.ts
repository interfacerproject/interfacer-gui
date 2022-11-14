import { ActionMeta } from "react-select";

export interface SelectOption<T> {
  label: string;
  value: T;
}

export type SelectOptions<T> = Array<SelectOption<T>>;

export function formatSelectOption<V>(label: string, value: V): SelectOption<V> {
  return {
    label,
    value,
  };
}

export function getOptionValue<V>(option: SelectOption<V>): V {
  return option.value;
}

export type SelectOnChange<T> = (newValue: T, actionMeta: ActionMeta<T>) => void;
