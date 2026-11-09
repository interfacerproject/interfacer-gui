import { GraphQLRequestError, InterfacerClient, throwIfGraphQLErrors } from "@dyne/interfacer-client";

const READ_METADATA = `
  query ResourceMetadataForEdit($id: ID!) {
    economicResource(id: $id) { id metadata }
  }
`;

function isMap(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
  );
}

function invalidResponse(): never {
  throw new GraphQLRequestError([
    { message: "Invalid resource metadata response.", extensions: { code: "INVALID_RESPONSE" } },
  ]);
}

/**
 * Preserve unrelated keys for serial edits against the current replacement API.
 * This is NOT an atomic patch/CAS: another client can write between read and
 * replacement. Backend atomic patch support remains required for concurrent edits.
 * Never reuse a project snapshot, retry an uncertain write, or swallow a denial.
 */
export async function updateResourceMetadataFields(
  client: Pick<InterfacerClient, "graphql" | "resources">,
  id: string,
  patch: Record<string, unknown>
): Promise<void> {
  if (!id || !isMap(patch)) throw new Error("Resource ID and metadata fields are required.");
  const result = await client.graphql.request<{
    economicResource: { id: string; metadata: unknown } | null;
  }>(READ_METADATA, { id });
  throwIfGraphQLErrors(result);
  const resource = result.data?.economicResource;
  if (!resource || resource.id !== id) invalidResponse();
  if (resource.metadata !== null && !isMap(resource.metadata)) invalidResponse();
  const metadata = { ...(resource.metadata || {}), ...patch };
  // Validate serialization before the SDK creates its metadata process.
  try {
    JSON.stringify(metadata);
  } catch {
    throw new Error("Metadata fields must be JSON serializable.");
  }
  await client.resources.updateMetadata(id, metadata);
}
