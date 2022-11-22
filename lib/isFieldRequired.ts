import * as yup from "yup";

export function isRequired(schema: yup.AnyObjectSchema, field: string) {
  return schema?.fields[field]?.exclusiveTests?.required || false;
}
