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

export interface StaleDraft {
  /** Edited fields whose stored value changed after the draft was opened. */
  fields: string[];
  /** The metadata read just now, which the user should review. */
  latest: Record<string, unknown> | null;
  /** Accept `latest` as the new baseline; the next save may then overwrite it. */
  keepMine: () => void;
}
export interface MetadataSaveOptions {
  /** Metadata as it was when the form opened; enables same-field conflict detection. */
  baseline?: Record<string, unknown> | null;
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (isMap(value))
    return Object.keys(value)
      .sort()
      .map(key => [key, canonical(value[key])]);
  return value;
}
const same = (a: Record<string, unknown> | null, b: Record<string, unknown> | null, key: string) => {
  const has = (m: Record<string, unknown> | null) => Boolean(m) && Object.prototype.hasOwnProperty.call(m, key);
  if (has(a) !== has(b)) return false;
  return !has(a) || JSON.stringify(canonical(a![key])) === JSON.stringify(canonical(b![key]));
};

/** The stale-draft details of a save error, if that is what it is. */
export function staleDraftOf(error: unknown): StaleDraft | undefined {
  return error instanceof GraphQLRequestError ? (error as { staleDraft?: StaleDraft }).staleDraft : undefined;
}
function staleDraftError(fields: string[], latest: Record<string, unknown> | null): GraphQLRequestError {
  const error = new GraphQLRequestError([
    { message: "Fields changed after this draft was opened.", extensions: { code: "CONFLICT" } },
  ]);
  const staleDraft: StaleDraft = { fields, latest, keepMine: () => {} };
  Object.defineProperty(error, "staleDraft", { value: staleDraft });
  return error;
}

/**
 * Read a fresh content fingerprint, then make one backend atomic field patch.
 * CAS closes the read-to-write race; unrelated fields are never resent/replaced.
 * No legacy process/accept/modify fallback or automatic retry after conflict or
 * ambiguous transport failure. With `baseline` (the metadata when the form
 * opened), an edited field that changed since then is a CONFLICT carrying
 * `staleDraft` and nothing is written; fields nobody else touched still save.
 * Without it, a draft opened before this fresh read can still replace a later
 * same-field edit.
 * Backend/SDK patch support is required; missing capability fails closed.
 */
export async function updateResourceMetadataFields(
  client: Pick<InterfacerClient, "graphql" | "resources">,
  id: string,
  patch: Record<string, unknown>,
  options: MetadataSaveOptions = {}
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
  if ("baseline" in options) {
    const baseline = options.baseline && isMap(options.baseline) ? options.baseline : null;
    const latest = resource.metadata as Record<string, unknown> | null;
    const stale = Object.keys(patch).filter(key => !same(baseline, latest, key));
    if (stale.length) throw staleDraftError(stale.sort(), latest);
  }
  await client.resources.patchMetadata(id, patch, { expectedMetadataHash: resource.metadataHash });
}
