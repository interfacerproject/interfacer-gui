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
let race: (() => void) | undefined;
let version = 0;
const initialHash = "a".repeat(64);
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
      writes.push({ id, replacement: metadata });
      current = {
        data: { economicResource: { id, metadata: JSON.parse(JSON.stringify(metadata)), metadataHash: initialHash } },
      };
    },
    patchMetadata: async (id: string, fields: any, options: { expectedMetadataHash?: string }) => {
      race?.();
      if (writeError) throw writeError;
      if (options.expectedMetadataHash !== current.data.economicResource.metadataHash)
        throw new GraphQLRequestError([{ message: "changed", extensions: { code: "CONFLICT" } }]);
      writes.push({ id, fields, expectedMetadataHash: options.expectedMetadataHash });
      current = {
        data: {
          economicResource: {
            id,
            metadata: { ...(current.data.economicResource.metadata || {}), ...fields },
            metadataHash: (++version).toString(16).padStart(64, "0"),
          },
        },
      };
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
  if (name === "lib/projectCreation") return require("../../lib/projectCreation");
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
        metadataHash: initialHash,
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
  race = undefined;
  version = 0;
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
      await (api[method] as any)("resource", value);
      assert.equal(reads, 1);
      assert.deepEqual(writes, [{ id: "resource", fields: { [key]: value }, expectedMetadataHash: initialHash }]);
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
    assert.deepEqual(writes[0].fields, { models: [] });
    assert.equal(current.data.economicResource.metadata.externalChange, "fresh");
  }));
test("null metadata is an empty map, not an unavailable response", async () =>
  render(async api => {
    current.data.economicResource.metadata = null;
    await api.updateRelations("resource", []);
    assert.deepEqual(writes[0].fields, { relations: [] });
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
for (const bad of [undefined, null, "", "not-a-fingerprint", 4]) {
  test("missing/invalid token cannot fall back to legacy metadata writes: " + String(bad), async () =>
    render(async api => {
      current.data.economicResource.metadataHash = bad;
      await assert.rejects(api.updateRelations("resource", []), (e: any) => e.code === "INVALID_RESPONSE");
      assert.equal(writes.length, 0);
    })
  );
}
test("read-to-write race conflicts without overwriting newer fields or retrying", async () =>
  render(async api => {
    race = () => {
      current.data.economicResource.metadataHash = "b".repeat(64);
      current.data.economicResource.metadata.relations = ["newer"];
    };
    await assert.rejects(api.updateRelations("resource", []), (e: any) => e.code === "CONFLICT");
    assert.deepEqual(current.data.economicResource.metadata.relations, ["newer"]);
    assert.equal(writes.length, 0);
    assert.equal(reads, 1);
  }));
test("uncertain patch failure never retries or falls back", async () =>
  render(async api => {
    writeError = new GraphQLRequestError([{ message: "safe", extensions: { code: "NETWORK_ERROR" } }]);
    await assert.rejects(api.updateRelations("resource", []), e => e === writeError);
    assert.equal(writes.length, 0);
    assert.equal(reads, 1);
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
