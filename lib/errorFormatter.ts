import { GraphQLErrors } from "@apollo/client/errors";

export function arrayToMultilineString(a: Array<string>): string {
  return a.join("\n");
}

export function gqlErrorFormatter(errors: GraphQLErrors): string {
  const errorsStr = errors.map(e => e.message);
  return arrayToMultilineString(errorsStr);
}

export function errorFormatter(e: any): string {
  if ("graphQLErrors" in e) {
    return gqlErrorFormatter(e.graphQLErrors);
  } else {
    return JSON.stringify(e);
  }
}
