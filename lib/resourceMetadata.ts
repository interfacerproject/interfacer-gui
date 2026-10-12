import { GraphQLRequestError, InterfacerClient, throwIfGraphQLErrors } from "@dyne/interfacer-client";

const READ_METADATA = `
  query ResourceMetadataForEdit($id: ID!) {
    economicResource(id: $id) { id metadata metadataHash }
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
 * Read a fresh content fingerprint, then make one backend atomic field patch.
 * CAS closes the read-to-write race; unrelated fields are never resent/replaced.
 * No legacy process/accept/modify fallback or automatic retry after conflict or
 * ambiguous transport failure. This is NOT stale-draft reconciliation: a draft
 * opened before this fresh read can still replace a later same-field edit.
 * Backend/SDK patch support is required; missing capability fails closed.
 */
export async function updateResourceMetadataFields(
  client: Pick<InterfacerClient, "graphql" | "resources">,
  id: string,
  patch: Record<string, unknown>
): Promise<void> {
  if (!id || !isMap(patch)) throw new Error("Resource ID and metadata fields are required.");
  const result = await client.graphql.request<{
    economicResource: { id: string; metadata: unknown; metadataHash: unknown } | null;
  }>(READ_METADATA, { id });
  throwIfGraphQLErrors(result);
  const resource = result.data?.economicResource;
  if (!resource || resource.id !== id) invalidResponse();
  if (resource.metadata !== null && !isMap(resource.metadata)) invalidResponse();
  if (typeof resource.metadataHash !== "string" || !/^[0-9a-f]{64}$/.test(resource.metadataHash)) invalidResponse();
  await client.resources.patchMetadata(id, patch, { expectedMetadataHash: resource.metadataHash });
}
