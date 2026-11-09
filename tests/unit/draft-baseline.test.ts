// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { test } from "node:test";
import Module from "node:module";
import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { useForm, UseFormReturn } from "react-hook-form";
import { GraphQLRequestError } from "@dyne/interfacer-client";
import { staleDraftOf, updateResourceMetadataFields } from "../../lib/resourceMetadata";

// ─── A fake server: fresh read + CAS patch ───────────────────────────

let server: { metadata: Record<string, unknown> | null; hash: number };
let patches: Array<{ fields: Record<string, unknown>; expected: string }>;
const hex = (n: number) => n.toString(16).padStart(64, "0");
const client = {
  graphql: {
    request: async (_q: string, { id }: { id: string }) => ({
      data: { economicResource: { id, metadata: server.metadata, metadataHash: hex(server.hash) } },
    }),
  },
  resources: {
    patchMetadata: async (_id: string, fields: Record<string, unknown>, o: { expectedMetadataHash: string }) => {
      if (o.expectedMetadataHash !== hex(server.hash))
        throw new GraphQLRequestError([{ message: "changed", extensions: { code: "CONFLICT" } }]);
      patches.push({ fields, expected: o.expectedMetadataHash });
      server = { metadata: { ...(server.metadata || {}), ...fields }, hash: server.hash + 1 };
    },
  },
};
function reset(metadata: Record<string, unknown> | null) {
  server = { metadata, hash: 1 };
  patches = [];
}
/** Someone else's edit, committed between opening the form and saving. */
function otherEditor(fields: Record<string, unknown>) {
  server = { metadata: { ...(server.metadata || {}), ...fields }, hash: server.hash + 1 };
}

test("unchanged edited field since the draft opened: one fresh read, one CAS patch", async () => {
  reset({ relations: ["a"], licenses: [] });
  await updateResourceMetadataFields(
    client as any,
    "r",
    { relations: ["a", "b"] },
    { baseline: { relations: ["a"], licenses: [] } }
  );
  assert.deepEqual(patches, [{ fields: { relations: ["a", "b"] }, expected: hex(1) }]);
});

test("the edited field changed after the draft opened: CONFLICT naming it, nothing written", async () => {
  reset({ relations: ["a"] });
  const baseline = { relations: ["a"] };
  otherEditor({ relations: ["a", "theirs"] });
  const error = await updateResourceMetadataFields(
    client as any,
    "r",
    { relations: ["a", "mine"] },
    { baseline }
  ).catch(e => e);
  assert.ok(error instanceof GraphQLRequestError);
  assert.equal(error.code, "CONFLICT");
  assert.deepEqual(staleDraftOf(error)?.fields, ["relations"]);
  assert.deepEqual(staleDraftOf(error)?.latest, { relations: ["a", "theirs"] });
  assert.deepEqual(patches, []);
  assert.deepEqual(server.metadata, { relations: ["a", "theirs"] });
});

test("a different field changed meanwhile: no conflict, both edits survive", async () => {
  reset({ relations: ["a"], licenses: [] });
  const baseline = { relations: ["a"], licenses: [] };
  otherEditor({ licenses: [{ licenseId: "MIT" }] });
  await updateResourceMetadataFields(client as any, "r", { relations: ["a", "b"] }, { baseline });
  assert.deepEqual(server.metadata, { relations: ["a", "b"], licenses: [{ licenseId: "MIT" }] });
});

test("comparison ignores object key order and treats absent as absent", async () => {
  reset({ productFilters: { b: 1, a: 2 } });
  await updateResourceMetadataFields(
    client as any,
    "r",
    { productFilters: { a: 3 }, price: "1" },
    { baseline: { productFilters: { a: 2, b: 1 } } }
  );
  assert.equal(patches.length, 1);
  reset(null);
  await updateResourceMetadataFields(client as any, "r", { relations: [] }, { baseline: null });
  assert.equal(patches.length, 1);
});

test("an absent field that someone else created meanwhile is a conflict", async () => {
  reset({});
  otherEditor({ declarations: { x: true } });
  const error = await updateResourceMetadataFields(
    client as any,
    "r",
    { declarations: { x: false } },
    { baseline: {} }
  ).catch(e => e);
  assert.deepEqual(staleDraftOf(error)?.fields, ["declarations"]);
});

test("without a baseline the previous behavior is unchanged", async () => {
  reset({ relations: ["a"] });
  otherEditor({ relations: ["theirs"] });
  await updateResourceMetadataFields(client as any, "r", { relations: ["mine"] });
  assert.deepEqual(server.metadata, { relations: ["mine"] });
  assert.equal(staleDraftOf(new Error("x")), undefined);
});

// ─── hooks/useMetadataDraft ──────────────────────────────────────────

const loader = Module as unknown as { _load: (name: string, ...args: unknown[]) => any },
  original = loader._load;
loader._load = function (name, ...args) {
  if (name === "hooks/useAuth" || name === "./useAuth") return { useAuth: () => ({ client }) };
  if (name === "lib/resourceMetadata") return require("../../lib/resourceMetadata");
  return original.call(this, name, ...args);
};
const { useMetadataDraft } = require("../../hooks/useMetadataDraft");
loader._load = original;

let draft: { save: (fields: Record<string, unknown>) => Promise<void> };
function HookHarness({ project }: { project: { id: string; metadata: Record<string, unknown> | null } }) {
  draft = useMetadataDraft(project);
  return null;
}
async function mount(project: { id: string; metadata: Record<string, unknown> | null }) {
  let r!: ReactTestRenderer;
  await act(async () => {
    r = create(React.createElement(HookHarness, { project }));
  });
  return r;
}

test("the baseline is frozen when the form opens, even if polling refreshes the project", async () => {
  reset({ relations: ["a"] });
  const r = await mount({ id: "r", metadata: { relations: ["a"] } });
  otherEditor({ relations: ["theirs"] });
  // FetchProjectLayout polls and re-renders with the newer project.
  await act(async () =>
    r.update(React.createElement(HookHarness, { project: { id: "r", metadata: server.metadata } }))
  );
  const error = await draft.save({ relations: ["mine"] }).catch(e => e);
  assert.deepEqual(staleDraftOf(error)?.fields, ["relations"]);
  assert.deepEqual(server.metadata, { relations: ["theirs"] });
});

test("“keep my version” rebases on what the user was shown, then the next save writes", async () => {
  reset({ relations: ["a"] });
  await mount({ id: "r", metadata: { relations: ["a"] } });
  otherEditor({ relations: ["theirs"] });
  const error = await draft.save({ relations: ["mine"] }).catch(e => e);
  staleDraftOf(error)!.keepMine();
  await draft.save({ relations: ["mine"] });
  assert.deepEqual(server.metadata, { relations: ["mine"] });
});

test("“keep my version” is not a blank cheque: a further change after it conflicts again", async () => {
  reset({ relations: ["a"] });
  await mount({ id: "r", metadata: { relations: ["a"] } });
  otherEditor({ relations: ["theirs"] });
  staleDraftOf(await draft.save({ relations: ["mine"] }).catch(e => e))!.keepMine();
  otherEditor({ relations: ["theirs again"] });
  assert.deepEqual(staleDraftOf(await draft.save({ relations: ["mine"] }).catch(e => e))?.fields, ["relations"]);
});

test("a second save from the same form does not conflict with its own first save", async () => {
  reset({ relations: ["a"] });
  await mount({ id: "r", metadata: { relations: ["a"] } });
  await draft.save({ relations: ["a", "b"] });
  await draft.save({ relations: ["a", "b", "c"] });
  assert.deepEqual(server.metadata, { relations: ["a", "b", "c"] });
});

test("another project gets its own baseline", async () => {
  reset({ relations: ["b"] });
  const r = await mount({ id: "r", metadata: { relations: ["a"] } });
  await act(async () =>
    r.update(React.createElement(HookHarness, { project: { id: "s", metadata: { relations: ["b"] } } }))
  );
  await draft.save({ relations: ["b", "c"] });
  assert.deepEqual(server.metadata, { relations: ["b", "c"] });
});

// ─── EditFormLayout: the stale-draft choice ──────────────────────────

let reloads = 0;
const router = {
  asPath: "/project/r/edit/relations",
  reload: () => void reloads++,
  push: () => {},
  events: { on() {}, off() {}, emit() {} },
};
loader._load = function (name, ...args) {
  if (name === "@bbtgnn/polaris-interfacer")
    return {
      Banner: ({ children }: any) => React.createElement("section", null, children),
      Button: ({ children, onClick }: any) => React.createElement("button", { onClick, type: "button" }, children),
    };
  if (name === "components/layout/FetchProjectLayout") return { useProject: () => ({ editAccess: undefined }) };
  if (name === "next/router") return { useRouter: () => router };
  if (name === "next-i18next")
    return {
      useTranslation: () => ({
        t: (k: string, o?: Record<string, unknown>) => (o?.fields ? `${k} [${o.fields}]` : k),
      }),
    };
  if (name === "components/LoadingOverlay") return { __esModule: true, default: () => null };
  if (name === "components/partials/create/FormShell")
    return { FormColumns: ({ children }: any) => React.createElement("div", null, children) };
  if (name === "components/partials/create/project/CreateProjectForm")
    return { ProjectTypeContext: React.createContext(null) };
  if (name === "./EditProjectNav") return { __esModule: true, default: () => null };
  if (name === "./SubmitChangesBar") return require("../../components/partials/project/edit/SubmitChangesBar");
  if (name === "lib/errorFormatter") return require("../../lib/errorFormatter");
  if (name === "lib/resourceMetadata") return require("../../lib/resourceMetadata");
  return original.call(this, name, ...args);
};
const EditFormLayout = require("../../components/partials/project/edit/EditFormLayout").default;
loader._load = original;

test("a stale draft names the changed fields and offers keep-mine or discard; the draft stays", async () => {
  (globalThis as any).window = { addEventListener() {}, removeEventListener() {}, confirm: () => false };
  reloads = 0;
  reset({ relations: ["a"] });
  let form!: UseFormReturn<{ title: string }>;
  let submits = 0;
  function Harness() {
    form = useForm({ defaultValues: { title: "Original" } });
    draft = useMetadataDraft({ id: "r", metadata: { relations: ["a"] } });
    return React.createElement(
      EditFormLayout,
      {
        formMethods: form,
        onSubmit: async () => {
          submits++;
          await draft.save({ relations: ["mine"] });
        },
      },
      React.createElement("input", { ...form.register("title") })
    );
  }
  let r!: ReactTestRenderer;
  await act(async () => {
    r = create(React.createElement(Harness));
  });
  await act(async () => form.setValue("title", "My draft", { shouldDirty: true }));
  otherEditor({ relations: ["theirs"] });
  await act(async () => {
    await r.root.findByType("form").props.onSubmit({ preventDefault() {}, persist() {} });
  });
  const text = JSON.stringify(r.toJSON());
  assert.match(text, /draftConflict\.message \[relations\]/);
  assert.equal(form.getValues("title"), "My draft");
  const buttons = r.root.findAll(n => n.type === "button" && typeof n.props.onClick === "function");
  const keep = buttons.find(b => JSON.stringify(b.props.children).includes("draftConflict.keepMine"))!;
  const discard = buttons.find(b => JSON.stringify(b.props.children).includes("draftConflict.discard"))!;
  assert.ok(keep && discard);

  await act(async () => keep.props.onClick());
  assert.equal(submits, 2, "keep-mine resubmits once, explicitly");
  assert.deepEqual(server.metadata, { relations: ["mine"] });
  assert.equal(reloads, 1, "successful save reloads as before");
});

test("discard drops the draft and reloads the latest version", async () => {
  (globalThis as any).window = { addEventListener() {}, removeEventListener() {}, confirm: () => false };
  reloads = 0;
  reset({ relations: ["a"] });
  let form!: UseFormReturn<{ title: string }>;
  function Harness() {
    form = useForm({ defaultValues: { title: "Original" } });
    draft = useMetadataDraft({ id: "r", metadata: { relations: ["a"] } });
    return React.createElement(
      EditFormLayout,
      { formMethods: form, onSubmit: () => draft.save({ relations: ["mine"] }) },
      React.createElement("input", { ...form.register("title") })
    );
  }
  let r!: ReactTestRenderer;
  await act(async () => {
    r = create(React.createElement(Harness));
  });
  await act(async () => form.setValue("title", "My draft", { shouldDirty: true }));
  otherEditor({ relations: ["theirs"] });
  await act(async () => {
    await r.root.findByType("form").props.onSubmit({ preventDefault() {}, persist() {} });
  });
  const discard = r.root
    .findAll(n => n.type === "button" && typeof n.props.onClick === "function")
    .find(b => JSON.stringify(b.props.children).includes("draftConflict.discard"))!;
  await act(async () => discard.props.onClick());
  assert.equal(form.formState.isDirty, false);
  assert.equal(reloads, 1);
  assert.deepEqual(server.metadata, { relations: ["theirs"] });
});
