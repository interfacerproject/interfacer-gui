// SPDX-License-Identifier: AGPL-3.0-or-later
import { useAuth } from "hooks/useAuth";
import { staleDraftOf, updateResourceMetadataFields } from "lib/resourceMetadata";
import { useCallback, useRef } from "react";

interface Project {
  id?: string;
  metadata?: unknown;
}
const snapshot = (metadata: unknown) =>
  metadata && typeof metadata === "object" ? (JSON.parse(JSON.stringify(metadata)) as Record<string, unknown>) : null;

/**
 * Save metadata fields against the state the edit form opened with. The
 * baseline is frozen at first render per project: FetchProjectLayout's polling
 * must not silently turn someone else's newer value into "what I started from".
 * A same-field change by someone else is a CONFLICT with `staleDraft`; its
 * `keepMine()` rebases on the value the user was just shown, so the next save
 * is an explicit overwrite (and a further change after that conflicts again).
 */
export function useMetadataDraft(project: Project) {
  const { client } = useAuth();
  const baseline = useRef<{ id?: string; metadata: Record<string, unknown> | null }>();
  if (!baseline.current || baseline.current.id !== project.id)
    baseline.current = { id: project.id, metadata: snapshot(project.metadata) };

  const save = useCallback(
    async (fields: Record<string, unknown>) => {
      if (!client) throw new Error("Not authenticated");
      const current = baseline.current!;
      try {
        await updateResourceMetadataFields(client, current.id!, fields, { baseline: current.metadata });
        // Our own committed values are the new starting point for this form.
        if (baseline.current === current) current.metadata = { ...(current.metadata || {}), ...snapshot(fields) };
      } catch (error) {
        const stale = staleDraftOf(error);
        if (stale)
          stale.keepMine = () => {
            if (baseline.current === current) current.metadata = snapshot(stale.latest);
          };
        throw error;
      }
    },
    [client]
  );
  return { save };
}
