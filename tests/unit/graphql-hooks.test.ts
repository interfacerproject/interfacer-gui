// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import Module from "node:module";

// Replace only the Auth hook; exercise real React hooks and the real SDK.
const loader = Module as unknown as { _load: (name: string, ...args: unknown[]) => unknown };
const originalLoad = loader._load;
let request: (...args: unknown[]) => Promise<any>;
const client = { graphql: { request: (...input: unknown[]) => request(...input) } };
loader._load = function (name, ...args) {
  if (name === "../hooks/useAuth" || name === "hooks/useAuth") return { useAuth: () => ({ client }) };
  return originalLoad.call(this, name, ...args);
};
const { useMutation, useQuery } = require("../../lib/apollo-compat") as typeof import("../../lib/apollo-compat");
const { useSdkMutation } = require("../../hooks/useSdkQuery") as typeof import("../../hooks/useSdkQuery");
loader._load = originalLoad;
const denial = { message: "forbidden", path: ["updateEconomicResource"], extensions: { code: "FORBIDDEN" } };

type MutationHook = (
  mutation: string
) => [(options: { variables: any }) => Promise<any>, { loading: boolean; error?: any }];
const mutationHooks: Array<[string, MutationHook]> = [
  ["useMutation", useMutation],
  ["useSdkMutation", useSdkMutation],
];
for (const [name, useHook] of mutationHooks) {
  test(name + " rejects permission errors before subsequent workflow steps and retains all errors", async () => {
    const errors = [denial, { message: "second denial", extensions: { code: "UNAUTHENTICATED" } }];
    request = async () => ({ data: { partial: "must not count as success" }, errors });
    let state: ReturnType<typeof useHook>;
    let renderer!: ReactTestRenderer;
    function Harness() {
      state = useHook("mutation Edit{echo}");
      return null;
    }
    await act(async () => {
      renderer = create(React.createElement(Harness));
    });
    let followedUp = false;
    await act(async () => {
      await assert.rejects(
        async () => {
          await state![0]({ variables: { draft: "keep this" } });
          followedUp = true;
        },
        (error: any) =>
          error.name === "GraphQLRequestError" &&
          error.code === "FORBIDDEN" &&
          JSON.stringify(error.graphQLErrors) === JSON.stringify(errors)
      );
    });
    assert.equal(followedUp, false);
    assert.equal(state![1].loading, false);
    assert.equal((state![1].error as any)?.code, "FORBIDDEN");
    renderer.unmount();
  });

  test(name + " resets loading and retains thrown transport errors", async () => {
    const network = new Error("Synthetic offline");
    request = async () => {
      throw network;
    };
    let state: ReturnType<typeof useHook>;
    let renderer!: ReactTestRenderer;
    function Harness() {
      state = useHook("mutation Edit{echo}");
      return null;
    }
    await act(async () => {
      renderer = create(React.createElement(Harness));
    });
    await act(async () => {
      await assert.rejects(
        () => state![0]({ variables: {} }),
        error => error === network
      );
    });
    assert.equal(state![1].loading, false);
    assert.equal(state![1].error, network);
    renderer.unmount();
  });
}

test("useMutation calls onError, not onCompleted, and clears stale success data on denial", async () => {
  request = async () => ({ data: { saved: true } });
  let state: ReturnType<typeof useMutation>;
  let renderer!: ReactTestRenderer;
  let completed = 0;
  let captured: any;
  function Harness() {
    state = useMutation("mutation Edit{echo}", {
      onCompleted: () => {
        completed++;
      },
      onError: error => {
        captured = error;
      },
    });
    return null;
  }
  await act(async () => {
    renderer = create(React.createElement(Harness));
  });
  await act(async () => {
    await state![0]({ variables: {} });
  });
  assert.equal(completed, 1);
  request = async () => ({ errors: [denial] });
  await act(async () => {
    await assert.rejects(() => state![0]({ variables: {} }));
  });
  assert.equal(completed, 1);
  assert.equal(captured.code, "FORBIDDEN");
  assert.equal(state![1].data, undefined);
  assert.equal(state![1].loading, false);
  renderer.unmount();
});

test("query revocation clears previously visible data and keeps structured error on refetch", async () => {
  request = async () => ({ data: { resource: "previously visible" } });
  let state: ReturnType<typeof useQuery>;
  let renderer!: ReactTestRenderer;
  function Harness() {
    state = useQuery("query Resource{echo}");
    return null;
  }
  await act(async () => {
    renderer = create(React.createElement(Harness));
  });
  assert.deepEqual(state!.data, { resource: "previously visible" });
  request = async () => ({ errors: [denial] });
  let result: any;
  await act(async () => {
    result = await state!.refetch();
  });
  assert.equal(state!.data, undefined);
  assert.equal((state!.error as any)?.code, "FORBIDDEN");
  assert.equal(state!.loading, false);
  assert.equal(result.error?.code, "FORBIDDEN");
  renderer.unmount();
});
