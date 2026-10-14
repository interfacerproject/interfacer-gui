// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { GraphQLRequestError } from "@dyne/interfacer-client";
import { submitContributionProposal } from "../../lib/contributionProposal";

const result = (created = true) => ({
  proposalId: "proposal",
  processId: "process",
  citeIntentId: "c",
  acceptIntentId: "a",
  modifyIntentId: "m",
  ownerId: "alice",
  created,
});
let log: string[];
function deps(over: Partial<Record<string, unknown>> = {}) {
  log = [];
  return {
    client: {
      resources: {
        createContributionProposal: async (p: unknown) => (log.push("propose:" + JSON.stringify(p)), result()),
        proposeContribution: async () => log.push("legacy"),
      },
    },
    notify: async (ownerId: string, proposalId: string) => void log.push(`notify:${ownerId}:${proposalId}`),
    points: [
      { name: "idea points", run: async () => void log.push("ideas") },
      { name: "strengths points", run: async () => void log.push("strengths") },
    ],
    ...over,
  } as any;
}
const input = { resourceForkedId: "fork", resourceOriginId: "origin", name: "n", note: "my work" };

test("a new proposal: one SDK call, then notify the server-chosen owner and assign points", async () => {
  const outcome = await submitContributionProposal(deps(), input);
  assert.deepEqual(outcome, { kind: "created", proposalId: "proposal" });
  assert.deepEqual(log, [
    'propose:{"resourceForkedId":"fork","resourceOriginId":"origin","name":"n","note":"my work"}',
    "notify:alice:proposal",
    "ideas",
    "strengths",
  ]);
});

test("an existing pending proposal returned by the server: no repeated notification or points", async () => {
  const d = deps();
  d.client.resources.createContributionProposal = async () => (log.push("propose"), result(false));
  assert.deepEqual(await submitContributionProposal(d, input), { kind: "existing", proposalId: "proposal" });
  assert.deepEqual(log, ["propose"]);
});

test("a rejected proposal returns the structured error and runs nothing else", async () => {
  const d = deps();
  const error = new GraphQLRequestError([{ message: "forbidden", extensions: { code: "FORBIDDEN" } }]);
  d.client.resources.createContributionProposal = async () => {
    log.push("propose");
    throw error;
  };
  assert.deepEqual(await submitContributionProposal(d, input), { kind: "error", error });
  assert.deepEqual(log, ["propose"]);
});

test("a failed follow-up after a confirmed proposal is reported, not retried", async () => {
  const d = deps({
    notify: async () => {
      log.push("notify");
      throw new Error("inbox down");
    },
  });
  const outcome = await submitContributionProposal(d, input);
  assert.deepEqual(outcome, { kind: "created", proposalId: "proposal", failed: ["notification"] });
  assert.equal(log.filter(e => e.startsWith("propose")).length, 1);
  assert.ok(log.includes("ideas") && log.includes("strengths"));
});

test("without SDK support it fails closed: no legacy four-request fallback", async () => {
  const d = deps();
  delete d.client.resources.createContributionProposal;
  const outcome = await submitContributionProposal(d, input);
  assert.equal(outcome.kind, "error");
  assert.equal((outcome as any).error.code, "UNSUPPORTED");
  assert.deepEqual(log, []);
});

test("the page uses the atomic path, shows errors and loads its strings", () => {
  const page = fs.readFileSync(path.join(__dirname, "../../pages/project/[id]/propose_contribution.tsx"), "utf8");
  assert.doesNotMatch(page, /CREATE_PROCESS|CREATE_PROPOSAL|PROPOSE_CONTRIBUTION|LINK_CONTRIBUTION_PROPOSAL_INTENT/);
  assert.match(page, /submitContributionProposal/);
  assert.match(page, /setFormError\(/);
  assert.doesNotMatch(page, /primaryAccountable!?\.id\],\s*MessageSubject/);
  const en = JSON.parse(fs.readFileSync(path.join(__dirname, "../../public/locales/en/common.json"), "utf8"));
  for (const key of ["followUpsFailed", "openProposal", "notification", "ideaPoints", "strengthsPoints"])
    assert.ok(en.contributionProposal?.[key], key);
});
