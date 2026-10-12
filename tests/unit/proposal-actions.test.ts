// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { test } from "node:test";
import Module from "node:module";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { GraphQLRequestError } from "@dyne/interfacer-client";
import { acceptContribution, runFollowUps } from "../../lib/proposalAcceptance";

// ─── lib/proposalAcceptance ──────────────────────────────────────────

const accepted = {
  proposalId: "proposal",
  status: "ACCEPTED",
  citeEventId: "c",
  acceptEventId: "a",
  modifyEventId: "m",
};

test("acceptContribution makes exactly one SDK call and returns its result", async () => {
  const calls: string[] = [];
  const client = { resources: { acceptContribution: async (id: string) => (calls.push(id), accepted) } };
  assert.deepEqual(await acceptContribution(client as any, "proposal"), accepted);
  assert.deepEqual(calls, ["proposal"]);
});

test("acceptContribution fails closed without SDK support: no legacy event fallback", async () => {
  const legacy: string[] = [];
  const client = { resources: { acceptProposal: async () => legacy.push("legacy") } };
  await assert.rejects(acceptContribution(client as any, "proposal"), (e: any) => e.code === "UNSUPPORTED");
  await assert.rejects(acceptContribution(undefined as any, "proposal"), (e: any) => e.code === "UNSUPPORTED");
  assert.deepEqual(legacy, []);
});

test("runFollowUps runs every step, isolates failures and never throws", async () => {
  const ran: string[] = [];
  const failed = await runFollowUps([
    { name: "notification", run: async () => void ran.push("notification") },
    {
      name: "points",
      run: async () => {
        ran.push("points");
        throw new Error("wallet down");
      },
    },
    { name: "ideas", run: async () => void ran.push("ideas") },
  ]);
  assert.deepEqual(ran, ["notification", "points", "ideas"]);
  assert.deepEqual(failed, ["points"]);
});

// ─── components/proposal/ProposalActions ─────────────────────────────

let control: string, accept: (id: string) => Promise<unknown>, reject: (...ids: string[]) => Promise<unknown>;
let log: string[], walletFails: boolean;
const native = ({ children }: any) => React.createElement("div", null, children);
const loader = Module as unknown as { _load: (name: string, ...args: unknown[]) => any },
  original = loader._load;
loader._load = function (name, ...args) {
  if (name === "hooks/useAuth")
    return {
      useAuth: () => ({
        user: { ulid: "alice", name: "Alice" },
        client: {
          resources: {
            acceptContribution: (id: string) => (log.push("accept:" + id), accept(id)),
            rejectProposal: (...ids: string[]) => (log.push("reject:" + ids.join(",")), reject(...ids)),
          },
        },
      }),
    };
  if (name === "hooks/useResourceControl")
    return {
      useResourceControl: (id: string) => (log.push("control:" + id), { status: control, refetch: async () => {} }),
    };
  if (name === "hooks/useInBox")
    return {
      useInBoxContext: () => ({
        sendMessage: async (_m: unknown, to: string[], subject: string) => void log.push(`message:${subject}:${to}`),
      }),
    };
  if (name === "hooks/useWallet")
    return {
      __esModule: true,
      default: () => ({
        addStrengthsPoints: async (id: string) => {
          if (walletFails) throw new Error("wallet down");
          log.push("strengths:" + id);
        },
        addIdeaPoints: async (id: string) => void log.push("ideas:" + id),
      }),
    };
  if (name === "pages/notification")
    return { MessageSubject: { CONTRIBUTION_ACCEPTED: "accepted", CONTRIBUTION_REJECTED: "rejected" } };
  if (name === "@bbtgnn/polaris-interfacer")
    return {
      Banner: ({ children, status }: any) => React.createElement("section", { "data-status": status }, children),
      Icon: () => null,
      Button: ({ children, onClick, disabled, loading }: any) =>
        React.createElement("button", { onClick, disabled: disabled || loading }, children),
    };
  if (name === "@shopify/polaris-icons") return { AddProductMajor: "add", RemoveProductMajor: "remove" };
  if (name === "next-i18next")
    return {
      useTranslation: () => ({
        t: (k: string, o?: Record<string, string>) => (o ? k.replace(/{{(\w+)}}/g, (_, v) => o[v]) : k),
      }),
    };
  if (name === "lib/errorFormatter") return require("../../lib/errorFormatter");
  if (name === "lib/proposalAcceptance") return require("../../lib/proposalAcceptance");
  if (name === "lib/PointsDistribution") return require("../../lib/PointsDistribution");
  if (name === "lib/types") return { ProposedStatus: { Pending: "PENDING", Accepted: "ACCEPTED", Refused: "REFUSED" } };
  return original.call(this, name, ...args);
};
const ProposalActions = require("../../components/proposal/ProposalActions").default;
loader._load = original;

const proposal = (status = "PENDING") => ({
  id: "proposal",
  status,
  note: "note",
  primaryIntents: [
    { id: "i-cite", resourceInventoriedAs: { id: "fork", name: "Fork", primaryAccountable: { id: "bob" } } },
    { id: "i-accept", resourceInventoriedAs: { id: "origin", name: "Origin", primaryAccountable: { id: "carol" } } },
    { id: "i-modify", resourceInventoriedAs: { id: "origin", name: "Origin", primaryAccountable: { id: "carol" } } },
  ],
});

let refetches: number;
async function render(p = proposal()): Promise<ReactTestRenderer> {
  let r!: ReactTestRenderer;
  await act(async () => {
    r = create(
      React.createElement(ProposalActions, {
        proposal: p,
        refetch: async () => void refetches++,
      })
    );
  });
  return r;
}
const buttons = (r: ReactTestRenderer) => r.root.findAllByType("button");
const button = (r: ReactTestRenderer, label: string) => buttons(r).find(b => b.props.children === label)!;
const text = (r: ReactTestRenderer) => JSON.stringify(r.toJSON());
function reset() {
  control = "controller";
  log = [];
  refetches = 0;
  walletFails = false;
  accept = async () => accepted;
  reject = async () => undefined;
}

test("actions follow the origin's controller, not primaryAccountable", async () => {
  reset();
  // Carol is primaryAccountable of the origin; Alice controls it.
  const r = await render();
  assert.ok(log.includes("control:origin"));
  assert.equal(buttons(r).length, 2);

  for (const status of ["read-only", "unassigned", "organization", "loading", "error"]) {
    reset();
    control = status;
    assert.equal(buttons(await render()).length, 0, status);
  }
});

test("no actions on a proposal that is not pending", async () => {
  reset();
  assert.equal(buttons(await render(proposal("ACCEPTED"))).length, 0);
});

test("accept: one atomic call, then notification and points, then refetch", async () => {
  reset();
  const r = await render();
  await act(async () => button(r, "Accept contribution").props.onClick());
  assert.deepEqual(
    log.filter(e => !e.startsWith("control:")),
    ["accept:proposal", "message:accepted:bob", "strengths:bob", "ideas:alice"]
  );
  assert.equal(refetches, 1);
});

test("a double click while accepting sends one request", async () => {
  reset();
  let release!: () => void;
  accept = () => new Promise(resolve => (release = () => resolve(accepted)));
  const r = await render();
  await act(async () => {
    button(r, "Accept contribution").props.onClick();
    button(r, "Accept contribution").props.onClick();
  });
  assert.ok(buttons(r).every(b => b.props.disabled));
  await act(async () => release());
  assert.equal(log.filter(e => e.startsWith("accept:")).length, 1);
});

test("a rejected accept shows the structured error, skips follow-ups and refetches", async () => {
  reset();
  accept = async () => {
    throw new GraphQLRequestError([{ message: "proposal is not pending", extensions: { code: "CONFLICT" } }]);
  };
  const r = await render();
  await act(async () => button(r, "Accept contribution").props.onClick());
  assert.match(text(r), /requestErrors\.conflict/);
  assert.deepEqual(
    log.filter(e => !e.startsWith("control:")),
    ["accept:proposal"]
  );
  assert.equal(refetches, 1);
});

test("a failed follow-up after a confirmed accept is a warning; accept is not repeated", async () => {
  reset();
  walletFails = true;
  const r = await render();
  await act(async () => button(r, "Accept contribution").props.onClick());
  assert.equal(log.filter(e => e.startsWith("accept:")).length, 1);
  assert.ok(log.includes("ideas:alice"));
  assert.match(text(r), /The contribution was accepted, but these follow-up steps failed/);
  assert.match(text(r), /"warning"/);
});

test("the warning stays visible after the refetched proposal is no longer pending", async () => {
  reset();
  walletFails = true;
  const r = await render();
  await act(async () => button(r, "Accept contribution").props.onClick());
  await act(async () => {
    r.update(React.createElement(ProposalActions, { proposal: proposal("ACCEPTED"), refetch: async () => {} }));
  });
  assert.equal(buttons(r).length, 0);
  assert.match(text(r), /The contribution was accepted, but these follow-up steps failed/);
});

test("reject: finishes the three intents through the SDK, then notifies the proposer", async () => {
  reset();
  const r = await render();
  await act(async () => button(r, "Reject contribution").props.onClick());
  assert.deepEqual(
    log.filter(e => !e.startsWith("control:")),
    ["reject:i-cite,i-accept,i-modify", "message:rejected:bob"]
  );
  assert.equal(refetches, 1);
});

test("a denied reject shows the error and sends no notification", async () => {
  reset();
  reject = async () => {
    throw new GraphQLRequestError([{ message: "forbidden", extensions: { code: "FORBIDDEN" } }]);
  };
  const r = await render();
  await act(async () => button(r, "Reject contribution").props.onClick());
  assert.match(text(r), /requestErrors\.permissionDenied/);
  assert.ok(!log.some(e => e.startsWith("message:")));
});

test("every ProposalActions key is in ProposalProps and the page loads that namespace", () => {
  const source = fs.readFileSync(path.join(__dirname, "../../components/proposal/ProposalActions.tsx"), "utf8");
  const keys = Array.from(source.matchAll(/\bt\(\s*"([^"]+)"/g), m => m[1]);
  const en = JSON.parse(fs.readFileSync(path.join(__dirname, "../../public/locales/en/ProposalProps.json"), "utf8"));
  assert.ok(keys.length >= 7);
  const page = fs.readFileSync(path.join(__dirname, "../../pages/proposal/[id].tsx"), "utf8");
  assert.match(page, /serverSideTranslations\(locale, \[[^\]]*"common"[^\]]*"ProposalProps"/);
  for (const key of keys) {
    assert.ok(Object.prototype.hasOwnProperty.call(en, key), key);
  }
});
