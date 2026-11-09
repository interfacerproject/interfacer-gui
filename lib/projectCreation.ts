// SPDX-License-Identifier: AGPL-3.0-or-later
import type { InterfacerClient } from "@dyne/interfacer-client";
import { FollowUp, runFollowUps } from "./proposalAcceptance";

export interface SkippedStep {
  name: string;
  skipped: string;
}
export type ProjectFollowUp = FollowUp | SkippedStep;

export type ProjectCreationOutcome =
  | { kind: "created"; projectId: string; failed: string[]; skipped: Array<{ name: string; reason: string }> }
  | { kind: "error"; error: unknown };

/**
 * Create the project (`core`: process, location, produce event), then run the
 * follow-ups for the new id. Once the project exists nothing is thrown and
 * nothing is repeated: follow-up failures are collected by name, together
 * with failures that happened before it (e.g. image uploads), so the page can
 * report them next to a link instead of an error that invites a duplicate.
 */
export async function createProjectWithFollowUps(
  core: () => Promise<string>,
  followUps: (projectId: string) => ProjectFollowUp[] | Promise<ProjectFollowUp[]>,
  options: { failedBefore?: string[] } = {}
): Promise<ProjectCreationOutcome> {
  let projectId: string;
  try {
    projectId = await core();
  } catch (error) {
    return { kind: "error", error };
  }
  let steps: ProjectFollowUp[] = [];
  const failed = [...(options.failedBefore || [])];
  try {
    steps = await followUps(projectId);
  } catch (error) {
    console.error("Preparing follow-ups failed:", error);
    failed.push("follow-ups");
  }
  const skipped = steps.filter((s): s is SkippedStep => "skipped" in s).map(s => ({ name: s.name, reason: s.skipped }));
  failed.push(...(await runFollowUps(steps.filter((s): s is FollowUp => "run" in s))));
  return { kind: "created", projectId, failed, skipped };
}

const CONTROL = `query ManufacturableDesignControl($id: ID!) {
  resourceControl(resourceId: $id) { controller { id } }
}`;

/**
 * Marking a linked design manufacturable changes that design, which only its
 * controller may do. Ask first and skip with a reason otherwise — including
 * when control is unassigned or cannot be read — rather than sending a write
 * the backend will deny.
 */
export async function manufacturableStep(
  client: Pick<InterfacerClient, "graphql" | "resources">,
  designId: string,
  userId: string,
  tags: string[]
): Promise<ProjectFollowUp> {
  const name = "mark design manufacturable";
  let controller: unknown;
  try {
    const result = await client.graphql.request<{ resourceControl: { controller?: { id?: string } } | null }>(CONTROL, {
      id: designId,
    });
    if (result.errors?.length) throw new Error("control query failed");
    controller = result.data?.resourceControl?.controller?.id;
  } catch {
    return { name, skipped: "controlUnknown" };
  }
  if (controller !== userId) return { name, skipped: "notController" };
  return { name, run: () => client.resources.updateClassifiedAs(designId, tags) };
}
