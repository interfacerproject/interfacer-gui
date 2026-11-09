// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { test } from "node:test";
import Module from "node:module";
import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { GraphQLRequestError } from "@dyne/interfacer-client";
let actor: string | undefined = "alice";
let requests: Array<{ variables: any; resolve: (v: any) => void; reject: (e: Error) => void }>;
const client = {
  graphql: {
    request: (_query: string, variables: any) =>
      new Promise((resolve, reject) => {
        requests.push({ variables, resolve, reject });
      }),
  },
};
const loader = Module as unknown as { _load: (name: string, ...args: unknown[]) => any };
const original = loader._load;
loader._load = function (name, ...args) {
  if (name === "./useAuth") return { useAuth: () => ({ client, user: actor ? { ulid: actor } : null }) };
  return original.call(this, name, ...args);
};
// The real hook is loaded only after the behavioral contracts exist.
const { useResourceControl } =
  require("../../hooks/useResourceControl") as typeof import("../../hooks/useResourceControl");
loader._load = original;
const response = (id: string, type = "Person") => ({
  data: { resourceControl: { controller: { id, __typename: type }, epoch: 0 } },
});
async function render(
  run: (h: {
    get: () => ReturnType<typeof useResourceControl>;
    update: (id?: string) => Promise<void>;
  }) => Promise<void>
) {
  requests = [];
  actor = "alice";
  let result!: ReturnType<typeof useResourceControl>, renderer!: ReactTestRenderer;
  function Harness({ id }: { id?: string }) {
    result = useResourceControl(id);
    return null;
  }
  const update = async (id = "resource") => {
    await act(async () => {
      renderer.update(React.createElement(Harness, { id }));
    });
  };
  try {
    await act(async () => {
      renderer = create(React.createElement(Harness, { id: "resource" }));
    });
    await run({ get: () => result, update });
  } finally {
    await act(async () => {
      renderer?.unmount();
    });
  }
}
test("own personal controller enables the edit hint", async () =>
  render(async h => {
    assert.equal(h.get().status, "loading");
    await act(async () => {
      requests[0].resolve(response("alice"));
    });
    assert.equal(h.get().status, "controller");
  }));
test("another person's control, including an accountable/contributor viewer, is read-only", async () =>
  render(async h => {
    await act(async () => {
      requests[0].resolve(response("bob"));
    });
    assert.equal(h.get().status, "read-only");
  }));
test("legacy unassigned control is distinct from a denied/failed query", async () =>
  render(async h => {
    await act(async () => {
      requests[0].resolve({ data: { resourceControl: null } });
    });
    assert.equal(h.get().status, "unassigned");
  }));
test("organization control is unknown here, not a guessed personal grant", async () =>
  render(async h => {
    await act(async () => {
      requests[0].resolve(response("alice", "Organization"));
    });
    assert.equal(h.get().status, "organization");
  }));
test("revocation refetch immediately suspends the old hint and clears it on denial", async () =>
  render(async h => {
    await act(async () => {
      requests[0].resolve(response("alice"));
    });
    let refetch!: Promise<void>;
    await act(async () => {
      refetch = h.get().refetch();
    });
    assert.equal(h.get().status, "loading");
    await act(async () => {
      requests[1].resolve({ errors: [{ message: "private", extensions: { code: "FORBIDDEN" } }] });
      await refetch;
    });
    assert.equal(h.get().status, "error");
    assert.ok(h.get().error instanceof GraphQLRequestError, String((h.get().error as any)?.stack));
  }));
test("a slower old response cannot restore a revoked hint", async () =>
  render(async h => {
    let refetch!: Promise<void>;
    await act(async () => {
      refetch = h.get().refetch();
    });
    await act(async () => {
      requests[1].resolve(response("bob"));
      await refetch;
    });
    await act(async () => {
      requests[0].resolve(response("alice"));
    });
    assert.equal(h.get().status, "read-only");
  }));
test("route change ignores late control from another resource", async () =>
  render(async h => {
    await h.update("other-resource");
    await act(async () => {
      requests[1].resolve(response("bob"));
    });
    await act(async () => {
      requests[0].resolve(response("alice"));
    });
    assert.equal(h.get().status, "read-only");
    assert.equal(requests[1].variables.id, "other-resource");
  }));
test("actor change invalidates the previous edit hint", async () =>
  render(async h => {
    await act(async () => {
      requests[0].resolve(response("alice"));
    });
    actor = "bob";
    await h.update();
    assert.equal(h.get().status, "loading");
    await act(async () => {
      requests[1].resolve(response("alice"));
    });
    assert.equal(h.get().status, "read-only");
  }));
for (const control of [
  undefined,
  {},
  { controller: null },
  { controller: { id: "alice", __typename: "Person" }, epoch: "1" },
]) {
  test("malformed control never yields an edit hint: " + JSON.stringify(control), async () =>
    render(async h => {
      await act(async () => {
        requests[0].resolve({ data: { resourceControl: control } });
      });
      assert.equal(h.get().status, "error");
    })
  );
}
test("guest has no personal edit hint and does not send an anonymous control request", async () =>
  render(async h => {
    actor = undefined;
    await h.update();
    assert.equal(h.get().status, "read-only");
    assert.equal(requests.length, 1);
  }));
test("transport error is retained without leaking or auto retrying", async () =>
  render(async h => {
    const error = new Error("offline");
    await act(async () => {
      requests[0].reject(error);
    });
    assert.equal(h.get().status, "error");
    assert.equal(h.get().error, error);
    assert.equal(requests.length, 1);
  }));
