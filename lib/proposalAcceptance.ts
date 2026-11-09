// SPDX-License-Identifier: AGPL-3.0-or-later
import type { AcceptContributionResult, InterfacerClient } from "@dyne/interfacer-client";

function unsupported(): Error & { code: string } {
  return Object.assign(new Error("This service cannot accept contributions atomically yet."), { code: "UNSUPPORTED" });
}

/**
 * Accept a contribution with the backend's one-transaction mutation. Fails
 * closed when the SDK lacks it: the legacy events-then-satisfactions sequence
 * can partially commit and duplicate on retry, so it is never a fallback. No
 * automatic retry; the backend returns the same events for an accepted proposal.
 */
export async function acceptContribution(
  client: Pick<InterfacerClient, "resources"> | null | undefined,
  proposalId: string
): Promise<AcceptContributionResult> {
  const resources = client?.resources as Partial<InterfacerClient["resources"]> | undefined;
  if (typeof resources?.acceptContribution !== "function") throw unsupported();
  return resources.acceptContribution(proposalId);
}

export interface FollowUp {
  name: string;
  run: () => Promise<unknown>;
}

/** Run every step after a confirmed write; returns the names of the failed ones. */
export async function runFollowUps(steps: FollowUp[]): Promise<string[]> {
  const failed: string[] = [];
  for (const step of steps) {
    try {
      await step.run();
    } catch (error) {
      console.error(`Follow-up "${step.name}" failed:`, error);
      failed.push(step.name);
    }
  }
  return failed;
}
