// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { test } from "node:test";
import Module from "node:module";
import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { GraphQLRequestError } from "@dyne/interfacer-client";
let current: any;
let readError: Error | undefined;
let writeError: Error | undefined;
let writes: any[] = [];
let reads = 0;
const client = {
  graphql: {
    request: async () => {
      reads++;
      if (readError) throw readError;
      return current;
    },
  },
  resources: {
    updateMetadata: async (id: string, metadata: any) => {
      if (writeError) throw writeError;
      writes.push({ id, metadata });
      current = { data: { economicResource: { id, metadata: JSON.parse(JSON.stringify(metadata)) } } };
    },
  },
};
const loader = Module as unknown as { _load: (name: string, ...args: unknown[]) => any };
const original = loader._load;
loader._load = function (name, ...args) {
  if (name === "./useAuth") return { useAuth: () => ({ client, user: { ulid: "alice" } }) };
  if (name === "./useResourceSpecs") return { useResourceSpecs: () => ({ hasAllSpecs: false }) };
  if (name === "hooks/useInBox") return { useInBoxContext: () => ({ sendMessage() {} }) };
  if (name === "hooks/useWallet")
    return { __esModule: true, default: () => ({ addIdeaPoints() {}, addStrengthsPoints() {} }) };
  if (name === "components/types") return require("../../components/types");
  if (name === "lib/tagging") return { TAG_PREFIX: {} };
  if (name === "lib/PointsDistribution" || name === "pages/notification") return {};
  if (name === "lib/resourceMetadata") return require("../../lib/resourceMetadata");
  if (name === "lib/errorFormatter") return require("../../lib/errorFormatter");
  if (name === "lib/devLog") return { __esModule: true, default() {} };
  if (name === "next-i18next") return { useTranslation: () => ({ t: (s: string) => s }) };
  return original.call(this, name, ...args);
};
const { useProjectCRUD } = require("../../hooks/useProjectCRUD") as typeof import("../../hooks/useProjectCRUD");
loader._load = original;

async function render(run: (api: ReturnType<typeof useProjectCRUD>) => Promise<void>) {
  let api!: ReturnType<typeof useProjectCRUD>, renderer!: ReactTestRenderer;
  function Harness() {
    api = useProjectCRUD();
    return null;
  }
  current = {
    data: {
      economicResource: {
        id: "resource",
        metadata: {
          repo: "https://example.invalid/source",
          licenses: [{ licenseId: "MIT", scope: "main" }],
          contributors: ["alice"],
          relations: ["related"],
          privateExtension: { keep: true },
        },
      },
    },
  };
  reads = 0;
  writes = [];
  readError = writeError = undefined;
  try {
    await act(async () => {
      renderer = create(React.createElement(Harness));
    });
    await run(api);
  } finally {
    await act(async () => {
      renderer?.unmount();
    });
  }
}
for (const [method, key, value] of [
  ["updateContributors", "contributors", ["bob"]],
  ["updateRelations", "relations", []],
  ["updateLicenses", "licenses", []],
  ["updateDeclarations", "declarations", { safety: false }],
] as const) {
  test(method + " preserves the latest unrelated metadata", async () =>
    render(async api => {
      const before = current.data.economicResource.metadata;
      await (api[method] as any)("resource", value);
      assert.equal(reads, 1);
      assert.deepEqual(writes, [{ id: "resource", metadata: { ...before, [key]: value } }]);
    })
  );
}
test("sequential different field edits do not erase each other, including explicit empty arrays", async () =>
  render(async api => {
    await api.updateContributors("resource", ["bob"]);
    await api.updateRelations("resource", []);
    assert.deepEqual(current.data.economicResource.metadata.contributors, ["bob"]);
    assert.deepEqual(current.data.economicResource.metadata.relations, []);
    assert.equal(current.data.economicResource.metadata.repo, "https://example.invalid/source");
  }));
test("does not merge from a stale project argument or cached metadata", async () =>
  render(async api => {
    current.data.economicResource.metadata.externalChange = "fresh";
    await api.updateMetadata({ id: "resource" }, { models: [] });
    assert.equal(writes[0].metadata.externalChange, "fresh");
  }));
test("null metadata is an empty map, not an unavailable response", async () =>
  render(async api => {
    current.data.economicResource.metadata = null;
    await api.updateRelations("resource", []);
    assert.deepEqual(writes[0].metadata, { relations: [] });
  }));
for (const bad of [undefined, [], "{}", 4]) {
  test("malformed metadata blocks write: " + String(bad), async () =>
    render(async api => {
      current.data.economicResource.metadata = bad;
      await assert.rejects(api.updateRelations("resource", []));
      assert.equal(writes.length, 0);
    })
  );
}
test("missing or wrong resource response cannot silently replace metadata", async () =>
  render(async api => {
    current = { data: { economicResource: null } };
    await assert.rejects(api.updateRelations("resource", []));
    current = { data: { economicResource: { id: "other", metadata: {} } } };
    await assert.rejects(api.updateRelations("resource", []));
    assert.equal(writes.length, 0);
  }));
test("structured read denial halts the write, without losing its code", async () =>
  render(async api => {
    current.errors = [{ message: "private upstream detail", extensions: { code: "FORBIDDEN" } }];
    await assert.rejects(api.updateRelations("resource", []), (e: any) => e.code === "FORBIDDEN");
    assert.equal(writes.length, 0);
  }));
test("network read failure and denied write propagate, without retry", async () =>
  render(async api => {
    readError = new Error("offline");
    await assert.rejects(api.updateRelations("resource", []), e => e === readError);
    assert.equal(writes.length, 0);
    readError = undefined;
    writeError = new GraphQLRequestError([{ message: "denied", extensions: { code: "FORBIDDEN" } }]);
    await assert.rejects(api.updateRelations("resource", []), e => e === writeError);
    assert.equal(reads, 2);
  }));
