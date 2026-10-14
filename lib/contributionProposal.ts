// SPDX-License-Identifier: AGPL-3.0-or-later
import type { ContributionProposalParams, InterfacerClient } from "@dyne/interfacer-client";
import { FollowUp, runFollowUps } from "./proposalAcceptance";

export type ContributionProposalOutcome =
  | { kind: "created"; proposalId: string; failed?: string[] }
  | { kind: "existing"; proposalId: string }
  | { kind: "error"; error: unknown };

export interface ContributionProposalDeps {
  client: Pick<InterfacerClient, "resources"> | null | undefined;
  /** Message the owner the server chose (the origin's controller). */
  notify: (ownerId: string, proposalId: string) => Promise<unknown>;
  /** Point assignments, run after the notification. */
  points: FollowUp[];
}

/**
 * Create a contribution proposal with the backend's one-transaction mutation;
 * fails closed without SDK support (the four-request sequence is never a
 * fallback). Follow-ups run only for a newly created proposal, each isolated:
 * a server-returned pending proposal is not notified or rewarded again.
 */
export async function submitContributionProposal(
  deps: ContributionProposalDeps,
  input: ContributionProposalParams
): Promise<ContributionProposalOutcome> {
  const resources = deps.client?.resources as Partial<InterfacerClient["resources"]> | undefined;
  if (typeof resources?.createContributionProposal !== "function")
    return {
      kind: "error",
      error: Object.assign(new Error("This service cannot create contribution proposals atomically yet."), {
        code: "UNSUPPORTED",
      }),
    };
  let result;
  try {
    result = await resources.createContributionProposal(input);
  } catch (error) {
    return { kind: "error", error };
  }
  if (!result.created) return { kind: "existing", proposalId: result.proposalId };
  const failed = await runFollowUps([
    { name: "notification", run: () => deps.notify(result.ownerId, result.proposalId) },
    ...deps.points,
  ]);
  return failed.length
    ? { kind: "created", proposalId: result.proposalId, failed }
    : { kind: "created", proposalId: result.proposalId };
}
