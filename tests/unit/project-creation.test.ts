// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { GraphQLRequestError } from "@dyne/interfacer-client";
import { createProjectWithFollowUps, manufacturableStep } from "../../lib/projectCreation";

let log: string[];
const step = (name: string, fail = false) => ({
  name,
  run: async () => {
    log.push(name);
    if (fail) throw new Error(name + " failed");
  },
});

test("the core runs once; follow-ups run in order after it", async () => {
  log = [];
  const outcome = await createProjectWithFollowUps(
    async () => (log.push("core"), "project"),
    id => [step("cite design:" + id), step("relation"), step("points")]
  );
  assert.deepEqual(outcome, { kind: "created", projectId: "project", failed: [], skipped: [] });
  assert.deepEqual(log, ["core", "cite design:project", "relation", "points"]);
});

test("a core failure is the only error; no follow-up runs", async () => {
  log = [];
  const error = new GraphQLRequestError([{ message: "forbidden", extensions: { code: "FORBIDDEN" } }]);
  const outcome = await createProjectWithFollowUps(
    async () => {
      log.push("core");
      throw error;
    },
    () => [step("relation")]
  );
  assert.deepEqual(outcome, { kind: "error", error });
  assert.deepEqual(log, ["core"]);
});

test("after the project exists, failures are collected, never thrown, and the core is not repeated", async () => {
  log = [];
  const outcome = await createProjectWithFollowUps(
    async () => (log.push("core"), "project"),
    () => [step("cite design", true), step("relation"), step("contributor", true), step("points")]
  );
  assert.deepEqual(outcome, {
    kind: "created",
    projectId: "project",
    failed: ["cite design", "contributor"],
    skipped: [],
  });
  assert.equal(log.filter(e => e === "core").length, 1);
  assert.deepEqual(log.slice(1), ["cite design", "relation", "contributor", "points"]);
});

test("failures from before the project (image uploads) are reported with the rest", async () => {
  log = [];
  const outcome = await createProjectWithFollowUps(
    async () => "project",
    () => [step("points")],
    { failedBefore: ["image photo.png"] }
  );
  assert.deepEqual(outcome.kind === "created" && outcome.failed, ["image photo.png"]);
});

// ─── marking a linked design manufacturable ──────────────────────────

function fakeClient(controller: string | null, opts: { throwControl?: boolean } = {}) {
  return {
    graphql: {
      request: async () => {
        log.push("control?");
        if (opts.throwControl) throw new Error("down");
        return { data: { resourceControl: controller ? { controller: { id: controller }, epoch: 0 } : null } };
      },
    },
    resources: { updateClassifiedAs: async (id: string) => void log.push("mark:" + id) },
  } as any;
}

test("the user's own design is marked manufacturable", async () => {
  log = [];
  const s = await manufacturableStep(fakeClient("bob"), "design", "bob", ["tag"]);
  assert.ok("run" in s);
  await s.run();
  assert.deepEqual(log, ["control?", "mark:design"]);
});

test("someone else's design is skipped with a reason; no write is attempted", async () => {
  log = [];
  const s = await manufacturableStep(fakeClient("alice"), "design", "bob", ["tag"]);
  assert.ok("skipped" in s);
  assert.deepEqual(log, ["control?"]);
});

test("an unassigned design or an unreadable control is skipped too, not guessed", async () => {
  log = [];
  assert.ok("skipped" in (await manufacturableStep(fakeClient(null), "design", "bob", ["tag"])));
  assert.ok(
    "skipped" in (await manufacturableStep(fakeClient("bob", { throwControl: true }), "design", "bob", ["tag"]))
  );
  assert.ok(!log.some(e => e.startsWith("mark:")));
});

test("skipped steps are reported separately from failures", async () => {
  log = [];
  const outcome = await createProjectWithFollowUps(
    async () => "project",
    () => [{ name: "mark design manufacturable", skipped: "needs the design's controller" }, step("points")]
  );
  assert.deepEqual(outcome, {
    kind: "created",
    projectId: "project",
    failed: [],
    skipped: [{ name: "mark design manufacturable", reason: "needs the design's controller" }],
  });
});

test("the create form shows creation errors and replaces itself with a result after creation", () => {
  const form = fs.readFileSync(
    path.join(__dirname, "../../components/partials/create/project/CreateProjectForm.tsx"),
    "utf8"
  );
  assert.match(form, /createProjectError|projectCreation\.error/);
  assert.match(form, /ProjectCreationResult/);
  const hook = fs.readFileSync(path.join(__dirname, "../../hooks/useProjectCRUD.ts"), "utf8");
  assert.match(hook, /createProjectWithFollowUps/);
  assert.match(hook, /manufacturableStep/);
  assert.doesNotMatch(hook, /devLog\("Image upload failed"/);
});
